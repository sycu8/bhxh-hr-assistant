import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  getDb: () => ({
    questionLog: { create: createMock },
  }),
}));

describe("logSearchQuery", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: "log-1" });
  });

  it("marks no-result when empty hits and no answer", async () => {
    const { logSearchQuery } = await import("@/lib/services/search-analytics.service");
    await logSearchQuery({
      question: "xyz unknown topic",
      resultCount: 0,
      hasAnswer: false,
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ noResult: true, resultCount: 0 }),
      }),
    );
  });
});
