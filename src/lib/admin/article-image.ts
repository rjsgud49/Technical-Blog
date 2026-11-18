import { apiFetch } from "@/lib/api/client";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

function assertImageFile(file: File) {
  const okType = ALLOWED.has(file.type) || file.type.startsWith("image/");
  if (!okType) {
    throw new Error("이미지 파일만 올릴 수 있습니다. (JPEG, PNG, GIF, WebP)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("이미지는 8MB 이하여야 합니다.");
  }
}

/** 서버에 업로드하고 공개 URL을 돌려준다 */
export async function fileToArticleSrc(file: File): Promise<string> {
  assertImageFile(file);
  const form = new FormData();
  form.append("file", file);
  const saved = await apiFetch<{ url: string }>("/uploads", {
    method: "POST",
    body: form,
  });
  if (!saved?.url) throw new Error("업로드 응답이 비어 있습니다.");
  return saved.url;
}
