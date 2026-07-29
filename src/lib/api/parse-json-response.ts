export async function parseJsonResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    const looksLikeHtml =
      text.trimStart().startsWith("<!DOCTYPE") ||
      text.trimStart().startsWith("<html");
    throw new Error(
      looksLikeHtml
        ? "Máy chủ trả về trang lỗi thay vì JSON. Vui lòng thử lại sau hoặc liên hệ IT."
        : `Phản hồi không hợp lệ từ máy chủ (HTTP ${res.status}).`,
    );
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Không đọc được phản hồi JSON từ máy chủ.");
  }
}
