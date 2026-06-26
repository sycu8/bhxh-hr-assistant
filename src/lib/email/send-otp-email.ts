import { sendCloudflareEmail } from "@/lib/email/cloudflare-email-transport";

export async function sendOtpEmail(params: {
  email: string;
  code: string;
  name: string;
}) {
  const subject = "Mã đăng nhập Cổng HR FPT Telecom";
  const text =
    `Xin chào ${params.name},\n\n` +
    `Mã OTP của bạn là: ${params.code}\n` +
    `Mã có hiệu lực 10 phút. Không chia sẻ mã này với người khác.\n\n` +
    `— Cổng HR FPT Telecom`;
  const html =
    `<p>Xin chào <strong>${params.name}</strong>,</p>` +
    `<p>Mã OTP của bạn là: <strong style="font-size:1.25rem;letter-spacing:0.2em">${params.code}</strong></p>` +
    `<p>Mã có hiệu lực 10 phút. Không chia sẻ mã này với người khác.</p>` +
    `<p>— Cổng HR FPT Telecom</p>`;

  await sendCloudflareEmail({
    to: params.email,
    fromName: "Cổng HR FPT Telecom",
    subject,
    text,
    html,
  });
}
