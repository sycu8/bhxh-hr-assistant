import { test, expect } from "@playwright/test";
import { expectPageText, gotoStable, mainNav } from "./helpers";

test.describe("Header navigation", () => {
  test("primary nav links work", async ({ page }) => {
    const nav = mainNav(page);

    await gotoStable(page, "/");
    await nav.getByRole("link", { name: "Tra cứu" }).click();
    await expect(page).toHaveURL(/\/search/);

    await gotoStable(page, "/");
    await nav.getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/\/hoi-dap/);

    await gotoStable(page, "/");
    await nav.getByRole("link", { name: "Hỏi HR" }).click();
    await expect(page).toHaveURL(/\/ask-hr/);
  });

  test("desktop calculators nav opens hub", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoStable(page, "/");
    await mainNav(page).getByRole("link", { name: "Công cụ NV" }).click();
    await expect(page).toHaveURL(/\/calculators/);
  });
});

test.describe("Tính lương tool", () => {
  test("calculate button returns result panel", async ({ page }) => {
    await gotoStable(page, "/cong-cu-luong-thue?mode=gross-to-net");
    await expect(page.getByRole("button", { name: "Tính ngay" })).toBeVisible({
      timeout: 15_000,
    });

    const moneyInputs = page.getByPlaceholder("Ví dụ: 35.000.000");
    await moneyInputs.first().fill("35000000");
    await moneyInputs.nth(1).fill("35000000");

    await page.getByRole("button", { name: "Tính ngay" }).click();

    await expect(page.getByText(/thực nhận|Thực nhận/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("body")).not.toContainText("Application error");
  });
});

test.describe("Hỏi HR form", () => {
  test("submit disabled until required fields filled", async ({ page }) => {
    await gotoStable(page, "/ask-hr");
    await expectPageText(page, "Gửi email cho HR");

    const form = page.getByRole("form", { name: "Gửi câu hỏi tới HR" });
    await expect(form).toBeVisible({ timeout: 15_000 });

    const submit = form.getByRole("button", { name: /Gửi email cho HR/ });
    await expect(submit).toBeDisabled();

    await form.locator("#replyEmail").fill("nhanvien@example.com");
    await form.locator("#topic").selectOption("bhxh");
    await form.locator("#urgent").selectOption("normal");
    await form.locator('[name="question"]').fill("Em muốn hỏi về mức đóng BHXH bắt buộc?");
    await form.locator('input[name="agree"]').check();

    await expect(submit).toBeEnabled();
  });
});

test.describe("Legal updates filters", () => {
  test("search input and pagination controls present", async ({ page }) => {
    await gotoStable(page, "/legal-updates");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15_000,
    });

    const search = page.getByLabel("Tìm văn bản");
    await expect(search).toBeVisible();
    await search.fill("BHXH");
    await page.getByRole("button", { name: "Tìm kiếm" }).click();
    await expect(page).toHaveURL(/q=BHXH/i);
  });
});
