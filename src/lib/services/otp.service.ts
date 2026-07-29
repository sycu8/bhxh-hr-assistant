import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/prisma";
import { hashSessionToken } from "@/lib/auth/session-cookie";
import { sendOtpEmail } from "@/lib/email/send-otp-email";
import { canAccessEmployeePortal } from "@/lib/auth/permissions";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;

function generateOtpCode(): string {
  if (
    process.env.E2E_TEST_MODE === "1" &&
    process.env.E2E_FIXED_OTP?.trim()
  ) {
    return process.env.E2E_FIXED_OTP.trim().padStart(OTP_LENGTH, "0").slice(-OTP_LENGTH);
  }
  const max = 10 ** OTP_LENGTH;
  const num = crypto.getRandomValues(new Uint32Array(1))[0]! % max;
  return String(num).padStart(OTP_LENGTH, "0");
}

async function hashOtpCode(email: string, code: string): Promise<string> {
  return hashSessionToken(`${email.toLowerCase()}:${code}`);
}

export async function requestEmployeeOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const user = await db.user.findUnique({ where: { email: normalized } });

  if (!user?.isActive || !canAccessEmployeePortal(user.role)) {
    return { sent: true as const };
  }

  const code = generateOtpCode();
  const codeHash = await hashOtpCode(normalized, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.otpCode.deleteMany({ where: { email: normalized } });
  await db.otpCode.create({
    data: {
      email: normalized,
      codeHash,
      userId: user.id,
      expiresAt,
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.info(`[otp] ${normalized}: ${code}`);
  }

  try {
    await sendOtpEmail({ email: normalized, code, name: user.name });
  } catch (error) {
    console.error("[otp] email send failed", error);
    if (process.env.NODE_ENV === "development") {
      return { sent: true as const };
    }
    const detail =
      error instanceof Error ? error.message : "Không gửi được email OTP.";
    throw ApiError.serviceUnavailable(
      `Không gửi được email OTP. ${detail}`,
    );
  }

  return { sent: true as const };
}

export async function verifyEmployeeOtp(email: string, code: string) {
  const normalized = email.trim().toLowerCase();
  const db = getDb();
  const otp = await db.otpCode.findFirst({
    where: {
      email: normalized,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  if (!otp?.user) {
    return null;
  }

  const expected = await hashOtpCode(normalized, code.trim());
  if (otp.codeHash !== expected) {
    return null;
  }

  if (!otp.user.isActive || !canAccessEmployeePortal(otp.user.role)) {
    return null;
  }

  await db.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return {
    id: otp.user.id,
    email: otp.user.email,
    name: otp.user.name,
    role: otp.user.role,
  };
}
