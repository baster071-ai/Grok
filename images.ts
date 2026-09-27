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

export function compressFile(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        resolve(drawImage(img));
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

function drawImage(img: HTMLImageElement): CompressedImage {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak canvas");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToJpeg(canvas);
}
