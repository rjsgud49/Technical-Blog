/** URL/제목 → 경로용 슬러그 (가능하면 ASCII, 한글은 NFC 유지) */
export function slugify(value: string) {
  const base = value
    .trim()
    .replace(/^https?:\/\//i, "")
    .toLowerCase()
    .normalize("NFC");

  const ascii = base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii.length >= 2) return ascii;

  const mixed = base
    .replace(/[^a-z0-9가-힣-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return mixed;
}

/** URL 파라미터·저장 슬러그 비교용 */
export function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}

export function slugsEqual(a: string, b: string) {
  return normalizeSlug(a) === normalizeSlug(b);
}
