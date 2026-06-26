export type HrisEmployeeRecord = {
  externalId: string;
  email: string;
  name: string;
  employeeCode: string;
  departmentCode: string;
  departmentName: string;
  jobTitle: string;
  managerEmployeeCode?: string;
  /** Email quản lý (từ cột Manager của Microsoft export) — dùng khi chưa map được mã NV. */
  managerEmail?: string;
  hireDate?: string;
  phone?: string;
  role?: "EMPLOYEE" | "MANAGER" | "HR" | "CB";
};

export type HrisLeaveBalanceRecord = {
  employeeCode: string;
  leaveTypeCode: string;
  year: number;
  entitled: number;
  used: number;
  remaining: number;
};

export type HrisPayslipRecord = {
  externalId: string;
  employeeCode: string;
  period: string;
  grossAmount: number;
  netAmount: number;
  lines: Array<{
    code: string;
    label: string;
    amount: number;
    category: string;
  }>;
};

export type HrisInsurancePeriodRecord = {
  employeeCode: string;
  insuranceType: string;
  startDate: string;
  endDate?: string;
  employerName?: string;
  salaryBase?: number;
};

export interface HrisAdapter {
  fetchEmployees(): Promise<HrisEmployeeRecord[]>;
  fetchLeaveBalances(year: number): Promise<HrisLeaveBalanceRecord[]>;
  fetchPayslips(period?: string): Promise<HrisPayslipRecord[]>;
  fetchInsurancePeriods(): Promise<HrisInsurancePeriodRecord[]>;
}
