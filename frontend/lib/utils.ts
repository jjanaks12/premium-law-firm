import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFileUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const host = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");
  return `${host}${url}`;
};
