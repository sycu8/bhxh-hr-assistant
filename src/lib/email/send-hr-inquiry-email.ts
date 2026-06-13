import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";
import type { AskHrSendInput } from "@/lib/validators/ask-hr.schema";

export type HrInquiryEmailPayload = AskHrSendInput & {
  ticketNumber?: string;
};

type EmailSendBinding = {
  send(message: {
    to: string;
    from: string | { email: string; name?: string };
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
};

type SendHrEmailEnv = {
  EMAIL?: EmailSendBinding;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  HR_EMAIL_FROM?: string;
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

function resolveEnv(): SendHrEmailEnv {
  try {
    const { env } = getCloudflareContext();
    return env as SendHrEmailEnv;
  } catch {
    return {
      CLOUDFLARE_EMAIL_API_TOKEN: process.env.CLOUDFLARE_EMAIL_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      HR_EMAIL_FROM: process.env.HR_EMAIL_FROM,
    };
  }
}

function resolveFromAddress(env: SendHrEmailEnv): string {
  const from =
    env.HR_EMAIL_FROM?.trim() || process.env.HR_EMAIL_FROM?.trim() || "";
  if (!from) {
    throw new Error(
      "Chưa cấu hình HR_EMAIL_FROM (địa chỉ gửi đã xác minh trên Cloudflare Email Service).",
    );
  }
  return from;
}

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

async function sendViaBinding(
  env: SendHrEmailEnv,
  from: string,
  message: ReturnType<typeof buildMessage>,
) {
  if (!env.EMAIL) {
    throw new Error("EMAIL binding chưa được cấu hình trên Worker.");
  }

  return env.EMAIL.send({
    to: HR_CONTACT_EMAIL,
    from: { email: from, name: "Cổng bảo hiểm FPT Telecom" },
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: message.replyTo,
  });
}

async function sendViaRestApi(
  env: SendHrEmailEnv,
  from: string,
  message: ReturnType<typeof buildMessage>,
) {
  const token = env.CLOUDFLARE_EMAIL_API_TOKEN?.trim();
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (!token || !accountId) {
    throw new Error(
      "Chưa cấu hình CLOUDFLARE_EMAIL_API_TOKEN hoặc CLOUDFLARE_ACCOUNT_ID.",
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: HR_CONTACT_EMAIL,
        from: { address: from, name: "Cổng bảo hiểm FPT Telecom" },
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
    },
  );

  const body = (await response.json()) as {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { delivered?: string[] };
  };

  if (!response.ok || !body.success) {
    const detail =
      body.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
      `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return {
    messageId:
      body.result?.delivered?.[0] ??
      `rest-${HR_CONTACT_EMAIL}-${Date.now()}`,
  };
}

export async function sendHrInquiryEmail(payload: HrInquiryEmailPayload) {
  const env = resolveEnv();
  const from = resolveFromAddress(env);
  const message = buildMessage(payload);

  try {
    if (env.EMAIL) {
      return await sendViaBinding(env, from, message);
    }
    return await sendViaRestApi(env, from, message);
  } catch (bindingError) {
    if (!env.CLOUDFLARE_EMAIL_API_TOKEN) throw bindingError;
    return sendViaRestApi(env, from, message);
  }
}
