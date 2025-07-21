import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractMimeType(dataUri: string): string | undefined {
    const match = dataUri.match(/^data:(.*?);/);
    return match ? match[1] : undefined;
}
