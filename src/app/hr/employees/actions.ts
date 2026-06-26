"use server";

import { revalidatePath } from "next/cache";
import { requireHrPermission } from "@/lib/auth/require-hr";
import { importMicrosoftUserExportCsv } from "@/lib/services/hris-sync.service";

export async function importMicrosoftCsvAction(formData: FormData) {
  await requireHrPermission("employee:write");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, message: "Vui lòng chọn file CSV export từ Microsoft." };
  }

  const csv = await file.text();
  const result = await importMicrosoftUserExportCsv(csv);

  revalidatePath("/hr/employees");
  revalidatePath("/hr");

  return {
    ok: true as const,
    message: `Đã import ${result.count} nhân viên (bỏ qua ${result.skipped} dòng).`,
    warnings: result.warnings,
  };
}
