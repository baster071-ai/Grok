export type CompressedImage = {
  mime: string;
  data: string;
  preview: string;
};

const MAX_EDGE = 720;
const QUALITY = 0.58;

function canvasToJpeg(canvas: HTMLCanvasElement): CompressedImage {
  const preview = canvas.toDataURL("image/jpeg", QUALITY);
  const data = preview.split(",")[1] ?? "";
  return { mime: "image/jpeg", data, preview };
}

function drawImageBitmap(bitmap: ImageBitmap | HTMLImageElement): CompressedImage {
  const width = "width" in bitmap ? bitmap.width : bitmap.naturalWidth;
  const height = "height" in bitmap ? bitmap.height : bitmap.naturalHeight;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvasToJpeg(canvas);
}

export async function compressFile(file: File): Promise<CompressedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      try {
        return drawImageBitmap(bitmap);
      } finally {
        if (typeof bitmap.close === "function") {
          bitmap.close();
        }
      }
    } catch {
      // Fallback to the classic image loader for browsers without createImageBitmap.
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        resolve(drawImageBitmap(img));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nie udało się wczytać zdjęcia"));
    };
    img.src = url;
  });
}

export function compressVideoFrame(video: HTMLVideoElement): CompressedImage {
  const w = video.videoWidth || 720;
  const h = video.videoHeight || 960;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak canvas");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvasToJpeg(canvas);
}

