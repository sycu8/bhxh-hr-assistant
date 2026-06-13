"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { ActionFeedback } from "@/lib/admin/action-feedback";
import {
  ActionToast,
  type ActionToastVariant,
} from "@/components/ui/action-toast";

const TOAST_MS = 2000;

const PendingContext = createContext(false);

export function useAdminActionPending() {
  return useContext(PendingContext);
}

type AdminActionFormProps = {
  action: (formData: FormData) => Promise<ActionFeedback | void>;
  children: ReactNode;
  className?: string;
  successMessage?: string;
};

export function AdminActionForm({
  action,
  children,
  className,
  successMessage = "Lưu thành công",
}: AdminActionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    message: string;
    variant: ActionToastVariant;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      startTransition(async () => {
        try {
          const result = await action(formData);
          setToast({
            message: result?.message ?? successMessage,
            variant: result?.variant ?? "success",
          });
          router.refresh();
        } catch (err) {
          setToast({
            message:
              err instanceof Error
                ? err.message
                : "Không thực hiện được thao tác.",
            variant: "error",
          });
        }
      });
    },
    [action, router, successMessage],
  );

  return (
    <>
      <ActionToast
        visible={Boolean(toast)}
        message={toast?.message}
        variant={toast?.variant}
      />
      <PendingContext.Provider value={pending}>
        <form
          onSubmit={handleSubmit}
          className={className}
          aria-busy={pending || undefined}
        >
          {children}
        </form>
      </PendingContext.Provider>
    </>
  );
}
