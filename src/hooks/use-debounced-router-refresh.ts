"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/** Gom nhiều lần refresh liên tiếp thành một lần — tránh vượt rate limit WAF. */
const DEFAULT_DELAY_MS = 2500;

let sharedTimer: ReturnType<typeof setTimeout> | null = null;
let sharedRefresh: (() => void) | null = null;

function scheduleSharedRefresh(refresh: () => void, delayMs: number) {
  sharedRefresh = refresh;
  if (sharedTimer) clearTimeout(sharedTimer);
  sharedTimer = setTimeout(() => {
    sharedTimer = null;
    sharedRefresh?.();
    sharedRefresh = null;
  }, delayMs);
}

export function useDebouncedRouterRefresh(delayMs = DEFAULT_DELAY_MS) {
  const router = useRouter();
  const delayRef = useRef(delayMs);
  delayRef.current = delayMs;

  useEffect(
    () => () => {
      if (sharedTimer) {
        clearTimeout(sharedTimer);
        sharedTimer = null;
      }
    },
    [],
  );

  return useCallback(() => {
    scheduleSharedRefresh(() => router.refresh(), delayRef.current);
  }, [router]);
}
