/** 기본 사이트 로고 (기술스택 아이콘 모음/icon.JPG) */
export const SITE_LOGO_SRC = "/brand/site-logo.jpg";

const MAX_BYTES = 512 * 1024;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function isSvgFile(file: File) {
  return (
    file.type === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg")
  );
}

function svgFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (!/<svg[\s>]/i.test(text)) {
        reject(new Error("유효한 SVG 파일이 아닙니다."));
        return;
      }
      const cleaned = text
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
        .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleaned)}`;
      if (dataUrl.length > MAX_BYTES) {
        reject(new Error("이미지가 너무 큽니다. 더 작은 파일을 선택해 주세요."));
        return;
      }
      resolve(dataUrl);
    };
    reader.readAsText(file);
  });
}

function rasterFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
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
        const quality = mime === "image/png" ? undefined : 0.85;
        const dataUrl = canvas.toDataURL(mime, quality);
        if (dataUrl.length > MAX_BYTES) {
          reject(new Error("이미지가 너무 큽니다. 더 작은 파일을 선택해 주세요."));
          return;
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/** 분야 로고용 — PNG/JPEG/WebP/GIF/SVG → data URL */
export function fileToLogoDataUrl(file: File): Promise<string> {
  const okType =
    ALLOWED_TYPES.has(file.type) ||
    isSvgFile(file) ||
    file.type.startsWith("image/");
  if (!okType) {
    return Promise.reject(
      new Error("이미지 파일만 올릴 수 있습니다. (PNG, JPEG, WebP, GIF, SVG)"),
    );
  }
  if (isSvgFile(file)) return svgFileToDataUrl(file);
  return rasterFileToDataUrl(file);
}

/** 분야 커스텀 로고가 없으면 사이트 기본 로고 */
export function resolveFieldLogo(logoDataUrl: string | null | undefined) {
  return logoDataUrl?.trim() || SITE_LOGO_SRC;
}
