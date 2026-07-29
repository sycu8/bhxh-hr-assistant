import { describe, expect, it } from "vitest";
import { parseMicrosoftUserExportCsv } from "@/lib/integrations/hris/microsoft-export-parser";

const SAMPLE_CSV = `User principal name,Display name,Department,Job title,Manager,Employee ID,Mobile Phone,Account enabled,Object Id
employee@fpt.com,Nguyễn Văn A,Nhân sự,Chuyên viên Nhân sự,manager@fpt.com,FTEL-0001,0901234567,True,11111111-1111-1111-1111-111111111111
manager@fpt.com,Trần Thị B,Nhân sự,Trưởng nhóm,,FTEL-0002,0912345678,True,22222222-2222-2222-2222-222222222222
disabled@fpt.com,Disabled User,IT,Staff,,FTEL-0099,,False,33333333-3333-3333-3333-333333333333
`;

describe("parseMicrosoftUserExportCsv", () => {
  it("maps Microsoft export columns to employee records", () => {
    const result = parseMicrosoftUserExportCsv(SAMPLE_CSV);
    expect(result.employees).toHaveLength(2);
    expect(result.skipped).toBe(1);

    const employee = result.employees.find(
      (e) => e.email === "employee@fpt.com",
    );
    expect(employee?.employeeCode).toBe("FTEL-0001");
    expect(employee?.managerEmployeeCode).toBe("FTEL-0002");
    expect(employee?.departmentName).toBe("Nhân sự");

    const manager = result.employees.find(
      (e) => e.email === "manager@fpt.com",
    );
    expect(manager?.role).toBe("MANAGER");
  });

  it("fails clearly when email column is missing", () => {
    const result = parseMicrosoftUserExportCsv("Name,Department\nA,HR");
    expect(result.employees).toHaveLength(0);
    expect(result.warnings[0]).toMatch(/email/i);
  });
});
