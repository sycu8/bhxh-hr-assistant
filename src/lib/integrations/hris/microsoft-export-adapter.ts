import { readFile } from "node:fs/promises";
import type {
  HrisAdapter,
  HrisEmployeeRecord,
  HrisInsurancePeriodRecord,
  HrisLeaveBalanceRecord,
  HrisPayslipRecord,
} from "@/lib/integrations/hris/types";
import { parseMicrosoftUserExportCsv } from "@/lib/integrations/hris/microsoft-export-parser";

export class MicrosoftExportAdapter implements HrisAdapter {
  private employees: HrisEmployeeRecord[] | null = null;
  private warnings: string[] = [];

  constructor(private readonly csvPath: string) {}

  async fetchEmployees(): Promise<HrisEmployeeRecord[]> {
    if (this.employees) return this.employees;

    const content = await readFile(this.csvPath, "utf8");
    const parsed = parseMicrosoftUserExportCsv(content);
    this.employees = parsed.employees;
    this.warnings = parsed.warnings;
    return parsed.employees;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  async fetchLeaveBalances(_year: number): Promise<HrisLeaveBalanceRecord[]> {
    return [];
  }

  async fetchPayslips(_period?: string): Promise<HrisPayslipRecord[]> {
    return [];
  }

  async fetchInsurancePeriods(): Promise<HrisInsurancePeriodRecord[]> {
    return [];
  }
}

export class MicrosoftCsvContentAdapter implements HrisAdapter {
  constructor(private readonly employees: HrisEmployeeRecord[]) {}

  async fetchEmployees(): Promise<HrisEmployeeRecord[]> {
    return this.employees;
  }

  async fetchLeaveBalances(_year: number): Promise<HrisLeaveBalanceRecord[]> {
    return [];
  }

  async fetchPayslips(_period?: string): Promise<HrisPayslipRecord[]> {
    return [];
  }

  async fetchInsurancePeriods(): Promise<HrisInsurancePeriodRecord[]> {
    return [];
  }
}
