import { MockHrisAdapter } from "@/lib/integrations/hris/mock-adapter";
import { MicrosoftExportAdapter } from "@/lib/integrations/hris/microsoft-export-adapter";
import type { HrisAdapter } from "@/lib/integrations/hris/types";

export type HrisSource = "mock" | "microsoft-csv";

export function resolveHrisSource(): HrisSource {
  const raw = process.env.HRIS_SOURCE?.trim().toLowerCase();
  if (raw === "microsoft-csv" || raw === "microsoft") {
    return "microsoft-csv";
  }
  return "mock";
}

export function resolveMicrosoftCsvPath(): string {
  return (
    process.env.HRIS_EMPLOYEE_CSV_PATH?.trim() ||
    process.env.HRIS_MICROSOFT_EXPORT_PATH?.trim() ||
    "./data/microsoft-users.csv"
  );
}

export function createHrisAdapter(): HrisAdapter {
  const source = resolveHrisSource();
  if (source === "microsoft-csv") {
    return new MicrosoftExportAdapter(resolveMicrosoftCsvPath());
  }
  return new MockHrisAdapter();
}
