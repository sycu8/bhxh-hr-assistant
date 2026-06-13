/** Site key công khai Turnstile — dùng trên client. */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function isTurnstileRequiredOnClient(): boolean {
  return Boolean(getTurnstileSiteKey());
}
