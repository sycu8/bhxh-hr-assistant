import { getCloudflareContext } from "@opennextjs/cloudflare";

export type EmailSendBinding = {
  send(message: {
    to: string;
    from: string | { email: string; name?: string };
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
};

export type CloudflareEmailEnv = {
  EMAIL?: EmailSendBinding;
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  HR_EMAIL_FROM?: string;
};

export function resolveCloudflareEmailEnv(): CloudflareEmailEnv {
  try {
    const { env } = getCloudflareContext();
    return env as CloudflareEmailEnv;
  } catch {
    return {
      CLOUDFLARE_EMAIL_API_TOKEN: process.env.CLOUDFLARE_EMAIL_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      HR_EMAIL_FROM: process.env.HR_EMAIL_FROM,
    };
  }
}

export function resolveHrEmailFrom(env: CloudflareEmailEnv = resolveCloudflareEmailEnv()): string {
  const from =
    env.HR_EMAIL_FROM?.trim() || process.env.HR_EMAIL_FROM?.trim() || "";
  if (!from) {
    throw new Error(
      "Chưa cấu hình HR_EMAIL_FROM (địa chỉ gửi đã xác minh trên Cloudflare Email).",
    );
  }
  return from;
}

export type SendCloudflareEmailInput = {
  to: string;
  fromName: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

async function sendViaBinding(
  env: CloudflareEmailEnv,
  from: string,
  input: SendCloudflareEmailInput,
) {
  if (!env.EMAIL) {
    throw new Error("EMAIL binding chưa được cấu hình trên Worker.");
  }

  return env.EMAIL.send({
    to: input.to,
    from: { email: from, name: input.fromName },
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  });
}

async function sendViaRestApi(
  env: CloudflareEmailEnv,
  from: string,
  input: SendCloudflareEmailInput,
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
        to: input.to,
        from: { address: from, name: input.fromName },
        subject: input.subject,
        text: input.text,
        html: input.html,
        reply_to: input.replyTo,
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
      body.result?.delivered?.[0] ?? `rest-${input.to}-${Date.now()}`,
  };
}

/** Gửi email qua Worker EMAIL binding, fallback REST Cloudflare Email Sending API. */
export async function sendCloudflareEmail(input: SendCloudflareEmailInput) {
  const env = resolveCloudflareEmailEnv();
  const from = resolveHrEmailFrom(env);

  try {
    if (env.EMAIL) {
      return await sendViaBinding(env, from, input);
    }
    return await sendViaRestApi(env, from, input);
  } catch (bindingError) {
    if (!env.CLOUDFLARE_EMAIL_API_TOKEN) throw bindingError;
    return sendViaRestApi(env, from, input);
  }
}
