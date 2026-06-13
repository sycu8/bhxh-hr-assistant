import { describe, expect, it, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const findFirstMock = vi.fn();
const createVersionMock = vi.fn();
const auditMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  getDb: () => ({
    fAQ: {
      findUnique: findUniqueMock,
      update: updateMock,
    },
    contentVersion: {
      findFirst: findFirstMock,
      create: createVersionMock,
    },
  }),
}));

vi.mock("@/lib/cms/audit-log", () => ({
  writeCmsAuditLog: auditMock,
}));

describe("publishFaq", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
    findFirstMock.mockReset();
    createVersionMock.mockReset();
    auditMock.mockReset();
    findUniqueMock.mockResolvedValue({
      id: "faq-1",
      slug: "test-faq",
      question: "Q?",
      shortAnswer: "A",
      status: "DRAFT",
    });
    findFirstMock.mockResolvedValue({ version: 1 });
    updateMock.mockResolvedValue({
      id: "faq-1",
      slug: "test-faq",
      status: "APPROVED",
    });
    createVersionMock.mockResolvedValue({ id: "v-2" });
  });

  it("approves FAQ and creates published version snapshot", async () => {
    const { publishFaq } = await import("@/lib/services/faq-cms.service");
    const result = await publishFaq({ faqId: "faq-1", actorId: "user-1" });
    expect(result.version).toBe(2);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "APPROVED" },
      }),
    );
    expect(createVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: "FAQ",
          version: 2,
          status: "PUBLISHED",
        }),
      }),
    );
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "faq.publish" }),
    );
  });
});
