import type { Media } from "./models";
import { nowIso, uid } from "./domain";

const unsupportedExtensions = [".dng", ".raw", ".arw", ".cr2", ".nef", ".orf", ".rw2"];

function assertSupportedImage(file: File) {
  const lowerName = file.name.toLowerCase();
  const isUnsupported = unsupportedExtensions.some((extension) => lowerName.endsWith(extension));
  if (isUnsupported) {
    throw new Error("DNG/RAW形式はブラウザで安定して扱えないため、JPEG/PNG/HEICなどを選んでください。");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("魚写真は画像ファイルを選んでください。");
  }
}

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("写真を読み込めませんでした。別の画像を選んでください。"));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("写真の変換に失敗しました。"));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function resizeImage(file: File, maxLength: number, quality: number) {
  const image = await loadImage(file);
  const scale = Math.min(1, maxLength / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("写真変換の準備に失敗しました。");
  context.drawImage(image, 0, 0, width, height);
  return canvasToBlob(canvas, quality);
}

export async function createMediaFromImage(file: File): Promise<Media> {
  assertSupportedImage(file);
  const [blob, thumbnailBlob] = await Promise.all([resizeImage(file, 1600, 0.8), resizeImage(file, 360, 0.76)]);
  return {
    id: uid("media"),
    blob,
    thumbnailBlob,
    mimeType: "image/jpeg",
    createdAt: nowIso(),
  };
}
