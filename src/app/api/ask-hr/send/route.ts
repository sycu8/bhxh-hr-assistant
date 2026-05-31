import { ApiError } from "@/lib/api/errors";
import { created, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { sendHrInquiryEmail } from "@/lib/email/send-hr-inquiry-email";
import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";
import { askHrSendSchema } from "@/lib/validators/ask-hr.schema";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const raw = await parseJsonBody<unknown>(req);
  const parsed = askHrSendSchema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      parsed.error.issues,
    );
  }

  try {
    const result = await sendHrInquiryEmail(parsed.data);
    return created({
      messageId: result.messageId,
      sentTo: HR_CONTACT_EMAIL,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không gửi được email.";
    console.error("[ask-hr/send]", message);
    throw ApiError.serviceUnavailable(
      "Không gửi được email lúc này. Vui lòng thử lại sau hoặc liên hệ HR trực tiếp.",
    );
  }
});
