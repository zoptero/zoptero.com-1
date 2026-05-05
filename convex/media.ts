"use node";

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConvexError, v } from "convex/values";
import { makeFunctionReference, type FunctionReference } from "convex/server";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function buildPublicMediaUrl(fileKey: string): string {
  const configuredPublic = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (configuredPublic) {
    return `${configuredPublic}/${fileKey}`;
  }

  const endpoint = process.env.R2_ENDPOINT?.replace(/\/+$/, "") ?? "";
  const bucket = process.env.R2_BUCKET_NAME ?? "";
  if (endpoint && bucket) {
    return `${endpoint}/${bucket}/${fileKey}`;
  }

  throw new ConvexError("Missing R2 public URL configuration");
}

export const generateUploadUrl = action({
  args: {
    clerkId: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    displayName: v.optional(v.string()),
    title: v.optional(v.string()),
    usage: v.optional(v.union(v.literal("avatar"), v.literal("seo"))),
  },
  returns: v.object({
    fileKey: v.string(),
    uploadUrl: v.string(),
    publicUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError("Not authorized");
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(args.fileType)) {
      throw new ConvexError("Unsupported image type");
    }
    if (args.fileSize <= 0 || args.fileSize > 5 * 1024 * 1024) {
      throw new ConvexError("Image must be 5 MB or smaller");
    }
    const bucket = process.env.R2_BUCKET_NAME!;
    const extension = (() => {
      switch (args.fileType) {
        case "image/jpeg": return "jpg";
        case "image/png": return "png";
        case "image/webp": return "webp";
        case "image/avif": return "avif";
        default: throw new ConvexError("Unsupported file type");
      }
    })();
    const mediaName = [args.displayName?.trim(), args.title?.trim()].filter(Boolean).join("-");
    const slug = mediaName
      ? mediaName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
      : "avatar";
    const usage = args.usage || "avatar";
    const fileKey = usage === "seo"
      ? `uploads/${args.clerkId}/seo/${slug}-${Date.now()}.${extension}`
      : `avatars/${args.clerkId}/${slug}-${Date.now()}.${extension}`;
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: args.fileType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = buildPublicMediaUrl(fileKey);
    return { fileKey, uploadUrl, publicUrl };
  },
});

export const generateViewUrl = action({
  args: {
    clerkId: v.string(),
    key: v.string(),
  },
  returns: v.object({ viewUrl: v.string() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError("Not authorized");
    }
    if (!args.key.includes(args.clerkId)) {
      throw new ConvexError("Invalid media key");
    }

    const bucket = process.env.R2_BUCKET_NAME!;
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: args.key,
    });
    const viewUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return { viewUrl };
  },
});

export const deleteMediaByKey = internalAction({
  args: {
    clerkId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic validation to ensure the key contains the user's clerkId
    // to prevent deleting other users' files
    if (!args.key.includes(args.clerkId)) {
      console.warn("Attempted to delete media not belonging to user", {
        clerkId: args.clerkId,
        key: args.key,
      });
      return;
    }

    const bucket = process.env.R2_BUCKET_NAME!;
    
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: args.key,
    });

    try {
      await s3.send(command);
    } catch (error) {
      console.error("Failed to delete media from R2", error);
      // We don't throw an error here to prevent the profile update mutation from failing
      // just because the old media cleanup failed.
    }
  },
});

export const deleteUserR2Folder = internalAction({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const bucket = process.env.R2_BUCKET_NAME!;

    const prefixes = [`avatars/${args.clerkId}/`, `uploads/${args.clerkId}/`];

    for (const prefix of prefixes) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
        });
        const listed = await s3.send(listCommand);

        if (listed.Contents && listed.Contents.length > 0) {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: listed.Contents.map((obj) => ({ Key: obj.Key })),
            },
          });
          await s3.send(deleteCommand);
        }
      } catch (e) {
        console.error(`Failed to delete R2 folder ${prefix}`, e);
      }
    }
  },
});

export const deleteUserMedia = internalAction({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.media.deleteUserR2Folder, { clerkId: args.clerkId });
  },
});
