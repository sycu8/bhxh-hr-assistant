import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";
import { sendCloudflareEmail } from "@/lib/email/cloudflare-email-transport";
import type { AskHrSendInput } from "@/lib/validators/ask-hr.schema";

export type HrInquiryEmailPayload = AskHrSendInput & {
  ticketNumber?: string;
};

const URGENT_LABEL: Record<HrInquiryEmailPayload["urgent"], string> = {
  normal: "Bình thường",
  soon: "Cần phản hồi trong vài ngày",
  urgent: "Khẩn",
};

const TOPIC_LABEL: Record<HrInquiryEmailPayload["topic"], string> = {
  bhxh: "BHXH",
  bhyt: "BHYT",
  bhtn: "BHTN",
  "thai-san": "Thai sản",
  khac: "Khác",
};

function buildMessage(payload: HrInquiryEmailPayload) {
  const topicLabel = TOPIC_LABEL[payload.topic];
  const urgentLabel = URGENT_LABEL[payload.urgent];
  const detail = payload.detail?.trim() ?? "";
  const replyEmail = payload.replyEmail.trim();

  const text = [
    "[Hỏi HR/C&B — Cổng tra cứu bảo hiểm FPT Telecom]",
    payload.ticketNumber ? `Mã ticket: ${payload.ticketNumber}` : null,
    `Chủ đề: ${topicLabel}`,
    `Mức khẩn: ${urgentLabel}`,
    `Email phản hồi: ${replyEmail}`,
    "",
    payload.question.trim(),
    "",
    detail || "(Không có ghi chú thêm)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <p><strong>[Hỏi HR/C&amp;B — Cổng tra cứu bảo hiểm FPT Telecom]</strong></p>
    <ul>
      ${payload.ticketNumber ? `<li><strong>Mã ticket:</strong> ${escapeHtml(payload.ticketNumber)}</li>` : ""}
      <li><strong>Chủ đề:</strong> ${topicLabel}</li>
      <li><strong>Mức khẩn:</strong> ${urgentLabel}</li>
      <li><strong>Email phản hồi:</strong> <a href="mailto:${replyEmail}">${replyEmail}</a></li>
    </ul>
    <p><strong>Câu hỏi:</strong></p>
    <p>${escapeHtml(payload.question.trim()).replace(/\n/g, "<br>")}</p>
    <p><strong>Ghi chú thêm:</strong></p>
    <p>${detail ? escapeHtml(detail).replace(/\n/g, "<br>") : "(Không có)"}</p>
  `.trim();

  return {
    subject: `Hỏi HR/C&B — ${topicLabel}`,
    text,
    html,
    replyTo: replyEmail,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendHrInquiryEmail(payload: HrInquiryEmailPayload) {
  const message = buildMessage(payload);

  return sendCloudflareEmail({
    to: HR_CONTACT_EMAIL,
    fromName: "Cổng bảo hiểm FPT Telecom",
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: message.replyTo,
  });
}
