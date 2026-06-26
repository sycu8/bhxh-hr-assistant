/** Site key công khai Turnstile — dùng trên client. */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function isTurnstileRequiredOnClient(): boolean {
  if (
    process.env.E2E_TEST_MODE === "1" ||
    process.env.NEXT_PUBLIC_E2E_TEST_MODE === "1"
  ) {
    return false;
  }
  return Boolean(getTurnstileSiteKey());
}
