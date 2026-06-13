import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  hasPermission,
  ROLE_PERMISSIONS,
} from "@/lib/auth/permissions";

describe("RBAC permissions", () => {
  it("allows admin all permissions", () => {
    expect(hasPermission("ADMIN", "faq:publish")).toBe(true);
    expect(hasPermission("ADMIN", "user:write")).toBe(true);
    expect(canAccessAdmin("ADMIN")).toBe(true);
  });

  it("allows HR CMS access without user management", () => {
    expect(canAccessAdmin("HR")).toBe(true);
    expect(hasPermission("HR", "faq:write")).toBe(true);
    expect(hasPermission("HR", "user:write")).toBe(false);
  });

  it("denies employee admin access", () => {
    expect(canAccessAdmin("EMPLOYEE")).toBe(false);
    expect(ROLE_PERMISSIONS.EMPLOYEE).toHaveLength(0);
  });
});
