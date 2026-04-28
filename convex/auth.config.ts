import { AuthConfig } from "convex/server";

const rawIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN?.trim();
const issuer = rawIssuer
  ? rawIssuer.replace(/^['\"]|['\"]$/g, "").replace(/\/+$/, "")
  : undefined;

if (!issuer) {
  throw new Error(
    "Missing CLERK_JWT_ISSUER_DOMAIN for Convex auth provider configuration"
  );
}

export default {
  providers: [
    {
      // Replace with your Clerk Issuer URL from your "convex" JWT template.
      // Found in Clerk Dashboard -> JWT Templates -> convex -> Issuer
      domain: issuer,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
