import type {
  HrisAdapter,
  HrisEmployeeRecord,
  HrisInsurancePeriodRecord,
  HrisLeaveBalanceRecord,
  HrisPayslipRecord,
} from "@/lib/integrations/hris/types";

const MOCK_EMPLOYEES: HrisEmployeeRecord[] = [
  {
    externalId: "hris-001",
    email: "employee@fpt.com",
    name: "Nguyễn Văn A",
    employeeCode: "FTEL-0001",
    departmentCode: "HR",
    departmentName: "Nhân sự",
    jobTitle: "Chuyên viên Nhân sự",
    managerEmployeeCode: "FTEL-0002",
    hireDate: "2022-03-15",
    phone: "0901234567",
    role: "EMPLOYEE",
  },
  {
    externalId: "hris-002",
    email: "manager@fpt.com",
    name: "Trần Thị B",
    employeeCode: "FTEL-0002",
    departmentCode: "HR",
    departmentName: "Nhân sự",
    jobTitle: "Trưởng nhóm Nhân sự",
    hireDate: "2019-08-01",
    phone: "0912345678",
    role: "MANAGER",
  },
  {
    externalId: "hris-003",
    email: "hr@fpt.com",
    name: "Lê Văn C",
    employeeCode: "FTEL-0003",
    departmentCode: "HR",
    departmentName: "Nhân sự",
    jobTitle: "Chuyên viên C&B",
    hireDate: "2020-01-10",
    phone: "0923456789",
    role: "HR",
  },
  {
    externalId: "hris-004",
    email: "cb@fpt.com",
    name: "Phạm Thị D",
    employeeCode: "FTEL-0004",
    departmentCode: "CB",
    departmentName: "C&B",
    jobTitle: "Chuyên viên Lương thưởng",
    hireDate: "2021-06-20",
    phone: "0934567890",
    role: "CB",
  },
  {
    externalId: "hris-005",
    email: "admin@fpt.com",
    name: "Hoàng Văn E",
    employeeCode: "FTEL-0005",
    departmentCode: "IT",
    departmentName: "Công nghệ thông tin",
    jobTitle: "Quản trị hệ thống",
    hireDate: "2018-11-05",
    role: "EMPLOYEE",
  },
];

export class MockHrisAdapter implements HrisAdapter {
  async fetchEmployees(): Promise<HrisEmployeeRecord[]> {
    return MOCK_EMPLOYEES;
  }

  async fetchLeaveBalances(year: number): Promise<HrisLeaveBalanceRecord[]> {
    return MOCK_EMPLOYEES.map((e) => ({
      employeeCode: e.employeeCode,
      leaveTypeCode: "ANNUAL",
      year,
      entitled: 12,
      used: e.employeeCode === "FTEL-0001" ? 2 : 0,
      remaining: e.employeeCode === "FTEL-0001" ? 10 : 12,
    }));
  }

  async fetchPayslips(period?: string): Promise<HrisPayslipRecord[]> {
    const targetPeriod = period ?? "2026-05";
    return MOCK_EMPLOYEES.map((e) => ({
      externalId: `payslip-${e.employeeCode}-${targetPeriod}`,
      employeeCode: e.employeeCode,
      period: targetPeriod,
      grossAmount: 25_000_000,
      netAmount: 20_500_000,
      lines: [
        { code: "BASE", label: "Lương cơ bản", amount: 20_000_000, category: "gross" },
        { code: "ALLOW", label: "Phụ cấp", amount: 5_000_000, category: "allowance" },
        { code: "BHXH", label: "BHXH (NLĐ)", amount: -2_000_000, category: "insurance" },
        { code: "PIT", label: "Thuế TNCN", amount: -2_500_000, category: "tax" },
      ],
    }));
  }

  async fetchInsurancePeriods(): Promise<HrisInsurancePeriodRecord[]> {
    return MOCK_EMPLOYEES.flatMap((e) => [
      {
        employeeCode: e.employeeCode,
        insuranceType: "BHXH",
        startDate: "2022-04-01",
        employerName: "FPT Telecom",
        salaryBase: 20_000_000,
      },
      {
        employeeCode: e.employeeCode,
        insuranceType: "BHYT",
        startDate: "2022-04-01",
        employerName: "FPT Telecom",
        salaryBase: 20_000_000,
      },
      {
        employeeCode: e.employeeCode,
        insuranceType: "BHTN",
        startDate: "2022-04-01",
        employerName: "FPT Telecom",
        salaryBase: 20_000_000,
      },
    ]);
  }
}
