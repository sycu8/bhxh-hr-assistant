"use client";

import { type ReactNode } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";

type SaveActivateFormProps = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
};

export function SaveActivateForm({
  action,
  children,
  className,
}: SaveActivateFormProps) {
  return (
    <AdminActionForm action={action} className={className}>
      {children}
    </AdminActionForm>
  );
}
