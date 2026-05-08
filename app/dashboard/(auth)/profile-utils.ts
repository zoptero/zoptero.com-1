// Utility functions for dashboard/profile page
import { z } from "zod";
import { format } from "date-fns";

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseDateFromInput(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export async function hasExactImageDimensions(
  file: File,
  expectedWidth: number,
  expectedHeight: number,
): Promise<boolean> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = () => {
        reject(new Error("Unable to read image dimensions"));
      };
      image.src = objectUrl;
    });
    return dimensions.width === expectedWidth && dimensions.height === expectedHeight;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isValidPhoneNumber(value: string): boolean {
  const normalized = value.replace(/[\s()-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}
