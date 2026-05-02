export interface CompressOptions {
  quality?: number;
  format?: 'auto' | 'jpeg' | 'png' | 'webp';
  resize?: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface CompressResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savings: number;
  url: string;
  fileName: string;
  width: number;
  height: number;
  format: string;
  timeMs: number;
}

export interface AnalysisResult {
  recommendedQuality: number;
  reason: string;
  bitsPerPixel: number;
  megapixels: number;
}

/**
 * Format bytes to a human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Calculate resized dimensions maintaining aspect ratio, only shrinking.
 */
function getResizedDimensions(width: number, height: number, maxW: number, maxH: number) {
  const ratio = Math.min(maxW / width, maxH / height);
  if (ratio >= 1) return { width, height }; // don't upscale
  return { 
    width: Math.round(width * ratio), 
    height: Math.round(height * ratio) 
  };
}

/**
 * Helper to load an image from a file
 */
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

/**
 * Helper to convert canvas to blob
 */
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to Blob failed"));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Auto-analyze image and suggest a quality level
 */
export function analyzeImage(file: File, img: HTMLImageElement): AnalysisResult {
  const fileSizeMB = file.size / (1024 * 1024);
  const megapixels = (img.width * img.height) / 1_000_000;
  const bitsPerPixel = (file.size * 8) / (img.width * img.height);
  
  let recommendedQuality = 0.8;
  let reason = "";
  
  if (bitsPerPixel > 24) {
    recommendedQuality = 0.65;
    reason = "This image has very high quality — safe to compress heavily.";
  } else if (bitsPerPixel > 12) {
    recommendedQuality = 0.78;
    reason = "Good quality image — moderate compression recommended.";
  } else {
    recommendedQuality = 0.88;
    reason = "Already compressed — light compression to avoid artifacts.";
  }
  
  if (megapixels > 12) {
    reason += " Also consider resizing (very large image).";
  }
  
  return { recommendedQuality, reason, bitsPerPixel, megapixels };
}

/**
 * Compress an image file using the Canvas API.
 * Works entirely in the browser — no server upload.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const startTime = performance.now();
  const { quality = 0.8, format = 'auto', resize } = options;
  
  const img = await loadImage(file);
  
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (resize?.enabled) {
    const dim = getResizedDimensions(img.width, img.height, resize.maxWidth, resize.maxHeight);
    targetWidth = dim.width;
    targetHeight = dim.height;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Draw image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Determine output type
  let outputType = "image/jpeg";
  let ext = "jpg";
  
  if (format === 'auto') {
    if (file.type === "image/png" && quality >= 0.95) {
      outputType = "image/png";
      ext = "png";
    } else if (file.type === "image/webp") {
      outputType = "image/webp";
      ext = "webp";
    }
  } else {
    outputType = `image/${format}`;
    ext = format === 'jpeg' ? 'jpg' : format;
  }

  const blob = await canvasToBlob(canvas, outputType, quality);
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const url = URL.createObjectURL(blob);
  const timeMs = performance.now() - startTime;

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    savings: Math.round((1 - blob.size / file.size) * 100),
    url,
    fileName: `${baseName}-compressed.${ext}`,
    width: targetWidth,
    height: targetHeight,
    format: outputType.split('/')[1].toUpperCase(),
    timeMs
  };
}

/**
 * Create a canvas from an image at given dimensions, with white background
 * (critical for PNG→JPEG transparency handling).
 */
function createCanvasFromImage(
  img: HTMLImageElement, width: number, height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Binary search on quality only (canvas dimensions are fixed).
 */
async function binarySearchQuality(
  canvas: HTMLCanvasElement,
  outputType: string,
  targetBytes: number,
  low: number,
  high: number,
  onAttempt?: (attempt: number, quality: number, size: number, targetBytes: number, progress: number) => void,
  attemptOffset: number = 0,
  maxAttempts: number = 20
): Promise<{ blob: Blob, quality: number, attempts: number }> {
  let bestBlob: Blob | null = null;
  let bestQuality = low;
  let bestDiff = Infinity;
  let attempts = 0;
  const tolerance = Math.max(targetBytes * 0.03, 3 * 1024); // 3% or 3KB

  while (attempts < maxAttempts && low <= high) {
    const mid = parseFloat(((low + high) / 2).toFixed(3));
    const blob = await canvasToBlob(canvas, outputType, mid);
    const diff = Math.abs(blob.size - targetBytes);

    if (onAttempt) {
      onAttempt(
        attemptOffset + attempts + 1,
        mid,
        blob.size,
        targetBytes,
        Math.round(((attempts + 1) / maxAttempts) * 100)
      );
    }

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBlob = blob;
      bestQuality = mid;
    }

    if (diff <= tolerance) break;

    if (blob.size < targetBytes) {
      low = mid + 0.005; // too small → higher quality
    } else {
      high = mid - 0.005; // too large → lower quality
    }

    attempts++;
  }

  return { blob: bestBlob!, quality: bestQuality, attempts };
}

/**
 * Compress or increase quality/dimensions to reach a specific target file size.
 *
 * Strategy:
 *   1. Determine max JPEG size (q=1.0) and min JPEG size (q=0.01) at original dims.
 *   2. CASE A – target is within [min, max]: binary search quality.
 *   3. CASE B – target > max: UPSCALE dimensions then binary search quality.
 *   4. CASE C – target < min: return min with warning.
 */
export async function compressToTargetSize(
  file: File,
  targetBytes: number,
  options: Omit<CompressOptions, 'quality'>,
  onAttempt?: (attempt: number, quality: number, size: number, targetBytes: number, progress: number) => void
): Promise<{
  result: CompressResult;
  attempts: number;
  finalQuality: number;
  diffText: string;
  qualityBoost: boolean;
  exactMatch: boolean;
  methodNote: string;
}> {
  const startTime = performance.now();
  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;
  const originalSize = file.size;

  // Apply optional resize (shrink only)
  let baseWidth = originalWidth;
  let baseHeight = originalHeight;
  if (options.resize?.enabled) {
    const dim = getResizedDimensions(originalWidth, originalHeight, options.resize.maxWidth, options.resize.maxHeight);
    baseWidth = dim.width;
    baseHeight = dim.height;
  }

  // Output type
  let outputType = "image/jpeg";
  let ext = "jpg";
  if (options.format === 'webp') {
    outputType = "image/webp";
    ext = "webp";
  }

  // ─── Step 1: Determine max & min JPEG size at base dimensions ───
  const baseCanvas = createCanvasFromImage(img, baseWidth, baseHeight);
  const maxBlob = await canvasToBlob(baseCanvas, outputType, 1.0);
  const minBlob = await canvasToBlob(baseCanvas, outputType, 0.01);
  const maxPossibleBytes = maxBlob.size;
  const minPossibleBytes = minBlob.size;

  // Helper to build final return value
  const buildResult = (
    blob: Blob,
    quality: number,
    totalAttempts: number,
    diffText: string,
    qualityBoost: boolean,
    exactMatch: boolean,
    methodNote: string,
    finalWidth: number,
    finalHeight: number
  ) => {
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const targetKB = Math.round(targetBytes / 1024);
    const url = URL.createObjectURL(blob);
    const timeMs = performance.now() - startTime;

    return {
      result: {
        blob,
        originalSize,
        compressedSize: blob.size,
        savings: Math.round((1 - blob.size / originalSize) * 100),
        url,
        fileName: `${baseName}_${targetKB}kb.${ext}`,
        width: finalWidth,
        height: finalHeight,
        format: outputType.split('/')[1].toUpperCase(),
        timeMs
      } as CompressResult,
      attempts: totalAttempts,
      finalQuality: quality,
      diffText,
      qualityBoost,
      exactMatch,
      methodNote
    };
  };

  const makeDiffText = (blobSize: number) => {
    const finalKB = Math.round(blobSize / 1024);
    const targetKB = Math.round(targetBytes / 1024);
    const diffKB = finalKB - targetKB;
    if (Math.abs(diffKB) <= 5) return '✓ Exact match!';
    return `(${diffKB > 0 ? '+' : ''}${diffKB} KB from target)`;
  };

  // ─── CASE A: Target within achievable range → quality search only ───
  if (targetBytes >= minPossibleBytes && targetBytes <= maxPossibleBytes) {
    if (onAttempt) onAttempt(0, 0, 0, targetBytes, 0);

    const { blob, quality, attempts } = await binarySearchQuality(
      baseCanvas, outputType, targetBytes, 0.01, 1.0, onAttempt
    );

    if (onAttempt) onAttempt(attempts, quality, blob.size, targetBytes, 100);

    const isBoost = blob.size > originalSize;
    return buildResult(
      blob, quality, attempts,
      makeDiffText(blob.size),
      isBoost, false, '', baseWidth, baseHeight
    );
  }

  // ─── CASE B: Target LARGER than max at original dims → upscale ───
  if (targetBytes > maxPossibleBytes) {
    if (onAttempt) onAttempt(0, 0, 0, targetBytes, 0);

    let totalAttempts = 0;
    let scaleLow = 1.0;
    let scaleHigh = 4.0; // max 4x upscale
    let bestResult: { blob: Blob; quality: number; scale: number; w: number; h: number } | null = null;
    let bestDiff = Infinity;

    // Binary search on scale factor
    for (let scaleAttempt = 0; scaleAttempt < 12; scaleAttempt++) {
      const scaleMid = (scaleLow + scaleHigh) / 2;
      const newW = Math.round(baseWidth * scaleMid);
      const newH = Math.round(baseHeight * scaleMid);
      const scaledCanvas = createCanvasFromImage(img, newW, newH);

      // Check max possible size at this scale
      const scaledMaxBlob = await canvasToBlob(scaledCanvas, outputType, 1.0);

      if (onAttempt) {
        totalAttempts++;
        onAttempt(totalAttempts, 1.0, scaledMaxBlob.size, targetBytes,
          Math.round((scaleAttempt / 12) * 50)); // first 50% of progress
      }

      if (scaledMaxBlob.size >= targetBytes) {
        // This scale is big enough → binary search quality at this scale
        const qResult = await binarySearchQuality(
          scaledCanvas, outputType, targetBytes, 0.01, 1.0,
          onAttempt, totalAttempts, 15
        );
        totalAttempts += qResult.attempts;

        const diff = Math.abs(qResult.blob.size - targetBytes);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestResult = { blob: qResult.blob, quality: qResult.quality, scale: scaleMid, w: newW, h: newH };
        }

        // If within 5% tolerance, we're done
        if (diff < targetBytes * 0.05) {
          if (onAttempt) onAttempt(totalAttempts, qResult.quality, qResult.blob.size, targetBytes, 100);
          return buildResult(
            qResult.blob, qResult.quality, totalAttempts,
            makeDiffText(qResult.blob.size),
            true, false,
            `📐 Upscaled ${scaleMid.toFixed(1)}x to ${newW}×${newH}px to reach target`,
            newW, newH
          );
        }

        // Try a smaller scale (we overshot or close)
        scaleHigh = scaleMid - 0.05;
      } else {
        // This scale isn't big enough
        scaleLow = scaleMid + 0.05;
      }

      if (scaleLow > scaleHigh) break;
    }

    // If we found something reasonable, use it
    if (bestResult) {
      if (onAttempt) onAttempt(totalAttempts, bestResult.quality, bestResult.blob.size, targetBytes, 100);
      return buildResult(
        bestResult.blob, bestResult.quality, totalAttempts,
        makeDiffText(bestResult.blob.size),
        true, false,
        `📐 Upscaled ${bestResult.scale.toFixed(1)}x to ${bestResult.w}×${bestResult.h}px to reach target`,
        bestResult.w, bestResult.h
      );
    }

    // Could not reach even at 4x → give the maximum possible
    const maxScaleW = Math.round(baseWidth * 4);
    const maxScaleH = Math.round(baseHeight * 4);
    const maxScaleCanvas = createCanvasFromImage(img, maxScaleW, maxScaleH);
    const maxScaleBlob = await canvasToBlob(maxScaleCanvas, outputType, 1.0);
    const maxKB = Math.round(maxScaleBlob.size / 1024);

    if (onAttempt) onAttempt(totalAttempts, 1.0, maxScaleBlob.size, targetBytes, 100);

    return buildResult(
      maxScaleBlob, 1.0, totalAttempts,
      makeDiffText(maxScaleBlob.size),
      true, false,
      `⚠ Max achievable: ~${maxKB} KB at 4x upscale (${maxScaleW}×${maxScaleH}px)`,
      maxScaleW, maxScaleH
    );
  }

  // ─── CASE C: Target SMALLER than minimum possible ───
  {
    const minKB = Math.round(minPossibleBytes / 1024);
    if (onAttempt) onAttempt(1, 0.01, minBlob.size, targetBytes, 100);

    return buildResult(
      minBlob, 0.01, 1,
      makeDiffText(minBlob.size),
      false, false,
      `⚠ Minimum achievable: ~${minKB} KB at lowest quality`,
      baseWidth, baseHeight
    );
  }
}

