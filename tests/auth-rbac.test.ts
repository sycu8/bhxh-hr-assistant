import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canAccessEmployeePortal,
  canAccessHrConsole,
  hasPermission,
  ROLE_PERMISSIONS,
} from "@/lib/auth/permissions";
import {
  canApproveForEmployee,
  canReadEmployeeRecord,
  maskPhone,
} from "@/lib/auth/access-control";

describe("RBAC permissions", () => {
  it("allows super admin all permissions", () => {
    expect(hasPermission("SUPER_ADMIN", "faq:publish")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "user:write")).toBe(true);
    expect(canAccessAdmin("SUPER_ADMIN")).toBe(true);
  });

  it("allows admin all permissions", () => {
    expect(hasPermission("ADMIN", "faq:publish")).toBe(true);
    expect(hasPermission("ADMIN", "user:write")).toBe(true);
    expect(canAccessAdmin("ADMIN")).toBe(true);
  });

  it("allows HR CMS access without user management", () => {
    expect(canAccessAdmin("HR")).toBe(true);
    expect(hasPermission("HR", "faq:write")).toBe(true);
    expect(hasPermission("HR", "user:write")).toBe(false);
    expect(canAccessHrConsole("HR")).toBe(true);
  });

  it("allows manager team approvals and HR console", () => {
    expect(canAccessAdmin("MANAGER")).toBe(false);
    expect(canAccessHrConsole("MANAGER")).toBe(true);
    expect(hasPermission("MANAGER", "approval:write:team")).toBe(true);
    expect(hasPermission("MANAGER", "employee:write")).toBe(false);
  });

  it("allows C&B payroll permissions", () => {
    expect(hasPermission("CB", "calculator:write")).toBe(true);
    expect(hasPermission("CB", "payslip:read:self")).toBe(true);
    expect(canAccessHrConsole("CB")).toBe(true);
    expect(canAccessAdmin("CB")).toBe(false);
  });

  it("allows employee portal self-service only", () => {
    expect(canAccessEmployeePortal("EMPLOYEE")).toBe(true);
    expect(canAccessAdmin("EMPLOYEE")).toBe(false);
    expect(canAccessHrConsole("EMPLOYEE")).toBe(false);
    expect(ROLE_PERMISSIONS.EMPLOYEE.length).toBeGreaterThan(0);
    expect(hasPermission("EMPLOYEE", "leave:write:self")).toBe(true);
    expect(hasPermission("EMPLOYEE", "employee:read")).toBe(false);
  });
});

describe("access control helpers", () => {
  it("allows self profile read", () => {
    expect(
      canReadEmployeeRecord({ id: "u1", role: "EMPLOYEE" }, "u1"),
    ).toBe(true);
  });

  it("allows manager to read direct report", () => {
    expect(
      canReadEmployeeRecord(
        { id: "mgr", role: "MANAGER" },
        "emp",
        "mgr",
      ),
    ).toBe(true);
  });

  it("allows manager to approve for direct report", () => {
    expect(
      canApproveForEmployee(
        { id: "mgr", role: "MANAGER" },
        "emp",
        "mgr",
      ),
    ).toBe(true);
  });

  it("masks phone numbers", () => {
    expect(maskPhone("0901234567")).toBe("090****567");
  });
});
