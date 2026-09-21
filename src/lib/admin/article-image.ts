import { apiFetch } from "@/lib/api/client";
import { isApiMode } from "@/lib/data-mode";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 1600;

function assertImageFile(file: File) {
  const okType = ALLOWED.has(file.type) || file.type.startsWith("image/");
  if (!okType) {
    throw new Error("이미지 파일만 올릴 수 있습니다. (JPEG, PNG, GIF, WebP)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("이미지는 8MB 이하여야 합니다.");
  }
}

function rasterToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const mime =
          file.type === "image/png" || file.type === "image/webp"
            ? file.type
            : "image/jpeg";
        resolve(canvas.toDataURL(mime, 0.85));
      };
      img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/** API 모드면 서버에 저장, 아니면 data URL */
export async function fileToArticleSrc(file: File): Promise<string> {
  assertImageFile(file);
  if (!isApiMode()) {
    return rasterToDataUrl(file);
  }
  const form = new FormData();
  form.append("file", file);
  const saved = await apiFetch<{ url: string }>("/uploads", {
    method: "POST",
    body: form,
  });
  if (!saved?.url) throw new Error("업로드 응답이 비어 있습니다.");
  return saved.url;
}
