// ─── TYPES ───

export interface ResizeOptions {
  width: number;
  height: number;
  format: string; // mime type e.g. 'image/jpeg'
  quality: number; // 0-1
}

export interface ResizeResult {
  blob: Blob;
  url: string;
  originalSize: number;
  newSize: number;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  format: string;
  fileName: string;
  timeMs: number;
  savings: number; // percentage
}

export interface SocialPreset {
  platform: string;
  emoji: string;
  name: string;
  width: number;
  height: number;
}

export interface PrintPreset {
  name: string;
  widthCm: number;
  heightCm: number;
}

// ─── CONSTANTS ───

export const SOCIAL_PRESETS: SocialPreset[] = [
  // Instagram
  { platform: "Instagram", emoji: "📸", name: "Post (Square)", width: 1080, height: 1080 },
  { platform: "Instagram", emoji: "📸", name: "Post (Portrait)", width: 1080, height: 1350 },
  { platform: "Instagram", emoji: "📸", name: "Post (Landscape)", width: 1080, height: 566 },
  { platform: "Instagram", emoji: "📸", name: "Story / Reel", width: 1080, height: 1920 },
  { platform: "Instagram", emoji: "📸", name: "Profile Picture", width: 320, height: 320 },
  // Facebook
  { platform: "Facebook", emoji: "👤", name: "Cover Photo", width: 820, height: 312 },
  { platform: "Facebook", emoji: "👤", name: "Profile Picture", width: 170, height: 170 },
  { platform: "Facebook", emoji: "👤", name: "Post Image", width: 1200, height: 630 },
  { platform: "Facebook", emoji: "👤", name: "Event Cover", width: 1920, height: 1005 },
  { platform: "Facebook", emoji: "👤", name: "Story", width: 1080, height: 1920 },
  // Twitter / X
  { platform: "Twitter / X", emoji: "🐦", name: "Header", width: 1500, height: 500 },
  { platform: "Twitter / X", emoji: "🐦", name: "Post Image", width: 1200, height: 675 },
  { platform: "Twitter / X", emoji: "🐦", name: "Profile Picture", width: 400, height: 400 },
  // YouTube
  { platform: "YouTube", emoji: "▶️", name: "Thumbnail", width: 1280, height: 720 },
  { platform: "YouTube", emoji: "▶️", name: "Channel Banner", width: 2560, height: 1440 },
  { platform: "YouTube", emoji: "▶️", name: "Profile Picture", width: 800, height: 800 },
  // LinkedIn
  { platform: "LinkedIn", emoji: "💼", name: "Cover Photo", width: 1584, height: 396 },
  { platform: "LinkedIn", emoji: "💼", name: "Post Image", width: 1200, height: 627 },
  { platform: "LinkedIn", emoji: "💼", name: "Profile Picture", width: 400, height: 400 },
  // WhatsApp
  { platform: "WhatsApp", emoji: "💬", name: "Profile Picture", width: 500, height: 500 },
  { platform: "WhatsApp", emoji: "💬", name: "Status", width: 1080, height: 1920 },
  // Pinterest
  { platform: "Pinterest", emoji: "📌", name: "Pin (Standard)", width: 1000, height: 1500 },
  { platform: "Pinterest", emoji: "📌", name: "Pin (Square)", width: 1000, height: 1000 },
];

export const PRINT_PRESETS: PrintPreset[] = [
  { name: "A4 Portrait", widthCm: 21, heightCm: 29.7 },
  { name: "A4 Landscape", widthCm: 29.7, heightCm: 21 },
  { name: "A3 Portrait", widthCm: 29.7, heightCm: 42 },
  { name: "A5 Portrait", widthCm: 14.8, heightCm: 21 },
  { name: "Letter", widthCm: 21.6, heightCm: 27.9 },
  { name: "4×6 Photo", widthCm: 10.2, heightCm: 15.2 },
  { name: "5×7 Photo", widthCm: 12.7, heightCm: 17.8 },
];

// ─── HELPERS ───

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function getAspectRatio(w: number, h: number): string {
  if (!w || !h) return "–";
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

export function getLockedHeight(origW: number, origH: number, newW: number): number {
  return Math.round((newW / origW) * origH);
}

export function getLockedWidth(origW: number, origH: number, newH: number): number {
  return Math.round((newH / origH) * origW);
}

export function cmToPixels(cm: number, dpi: number): number {
  return Math.round((cm / 2.54) * dpi);
}

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function inchToPixels(inch: number, dpi: number): number {
  return Math.round(inch * dpi);
}

export function pixelsToCm(px: number, dpi: number): number {
  return parseFloat(((px * 2.54) / dpi).toFixed(2));
}

export function pixelsToMm(px: number, dpi: number): number {
  return parseFloat(((px * 25.4) / dpi).toFixed(1));
}

export function pixelsToInch(px: number, dpi: number): number {
  return parseFloat((px / dpi).toFixed(2));
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function getMimeFromFormat(format: string, originalType: string): { mime: string; ext: string } {
  switch (format) {
    case "jpeg": return { mime: "image/jpeg", ext: "jpg" };
    case "png":  return { mime: "image/png",  ext: "png" };
    case "webp": return { mime: "image/webp", ext: "webp" };
    default: {
      // "same" — keep original
      const ext = originalType === "image/png" ? "png" : originalType === "image/webp" ? "webp" : "jpg";
      const mime = originalType.startsWith("image/") ? (originalType === "image/gif" || originalType === "image/bmp" ? "image/png" : originalType) : "image/jpeg";
      return { mime, ext };
    }
  }
}

// ─── CORE RESIZE ───

export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ResizeResult> {
  const startTime = performance.now();
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // White background for JPEG (no transparency)
  if (options.format === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, options.width, options.height);
  }

  ctx.drawImage(img, 0, 0, options.width, options.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas to Blob failed"))),
      options.format,
      options.quality
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = extMap[options.format] || "png";
  const url = URL.createObjectURL(blob);
  const timeMs = performance.now() - startTime;

  return {
    blob,
    url,
    originalSize: file.size,
    newSize: blob.size,
    originalWidth: img.width,
    originalHeight: img.height,
    newWidth: options.width,
    newHeight: options.height,
    format: options.format,
    fileName: `${baseName}_resized.${ext}`,
    timeMs,
    savings: Math.round((1 - blob.size / file.size) * 100),
  };
}

// Quick preview — generates a blob URL from the resized canvas
export async function generatePreview(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: string,
  quality: number
): Promise<{ url: string; estimatedSize: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (format === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Preview failed"))),
      format,
      quality
    );
  });

  return { url: URL.createObjectURL(blob), estimatedSize: blob.size };
}
