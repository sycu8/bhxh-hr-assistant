/**
 * Chuẩn hoá URL tải ảnh để giảm băng thông (Edge-friendly, không cần sharp).
 * Với Unsplash: thêm tham số kích thước & nén.
 */
export function optimizeImageFetchUrl(original: string, maxWidth: number): string {
  try {
    const u = new URL(original);
    if (u.hostname === "images.unsplash.com" || u.hostname.endsWith(".unsplash.com")) {
      u.searchParams.set("w", String(maxWidth));
      u.searchParams.set("q", "82");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "max");
      return u.toString();
    }
    return original;
  } catch {
    return original;
  }
}

export function guessExtensionFromContentType(ct: string | null): string {
  if (!ct) return "bin";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("gif")) return "gif";
  return "bin";
}
