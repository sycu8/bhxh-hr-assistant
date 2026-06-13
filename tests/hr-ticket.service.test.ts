import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const findFirstMock = vi.fn();
const updateMock = vi.fn();
const auditMock = vi.fn();
const emailMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  getDb: () => ({
    hrTicket: {
      findFirst: findFirstMock,
      create: createMock,
      update: updateMock,
    },
  }),
}));

vi.mock("@/lib/email/send-hr-inquiry-email", () => ({
  sendHrInquiryEmail: emailMock,
}));

vi.mock("@/lib/cms/audit-log", () => ({
  writeCmsAuditLog: auditMock,
}));

describe("createHrTicket", () => {
  beforeEach(() => {
    createMock.mockReset();
    findFirstMock.mockReset();
    updateMock.mockReset();
    auditMock.mockReset();
    emailMock.mockReset();
    findFirstMock.mockResolvedValue(null);
    emailMock.mockResolvedValue({ messageId: "msg-1" });
    createMock.mockResolvedValue({
      id: "t1",
      ticketNumber: "HR-2026-0001",
      topic: "bhxh",
      priority: "NORMAL",
      status: "OPEN",
    });
    updateMock.mockResolvedValue({});
  });

  it("creates ticket with sequential number and audits", async () => {
    const { createHrTicket } = await import("@/lib/services/hr-ticket.service");
    const ticket = await createHrTicket({
      question: "Hỏi về BHXH",
      topic: "bhxh",
      urgent: "normal",
      replyEmail: "nv@fpt.com",
    });
    expect(ticket.ticketNumber).toBe("HR-2026-0001");
    expect(createMock).toHaveBeenCalled();
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "ticket.create", entityType: "HrTicket" }),
    );
  });
});
