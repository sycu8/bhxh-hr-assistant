import { created, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { askHrSendSchema } from "@/lib/validators/ask-hr.schema";
import { createHrTicket } from "@/lib/services/hr-ticket.service";
import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const raw = await parseJsonBody<unknown>(req);
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const parsed = askHrSendSchema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
      parsed.error.issues,
    );
  }

  const ticket = await createHrTicket({
    ...parsed.data,
    searchQuery: parsed.data.searchQuery,
    questionLogId: parsed.data.questionLogId,
  });

  return created({
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    notifyEmailSent: ticket.notifyEmailSent,
    hrContact: HR_CONTACT_EMAIL,
  });
});
