import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_OWNER_EMAIL || "";
const password = process.env.PLAYWRIGHT_OWNER_PASSWORD || "";

test.describe("Specialist Doctor settings", () => {
  test.skip(!email || !password, "Owner credentials not provided via env");

  test.beforeEach(async ({ page }) => {
    await page.goto("/ar/auth/login");
    await page.fill("#identifier", email);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/ar\/doctor\/specialist\/dashboard/, {
      timeout: 30_000,
    });
    await page.goto("/ar/doctor/specialist/settings");
    await expect(
      page.getByRole("heading", { name: "إعدادات حساب الطبيب" }),
    ).toBeVisible();
  });

  test("loads Doctor-owned sections without console or hydration errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const navigation = page.locator(".doctor-settings-nav-item");
    await expect(page.locator(".doctor-settings-shell")).toHaveAttribute(
      "dir",
      "rtl",
    );
    await expect(page.locator(".doctor-settings-shell")).toHaveAttribute(
      "lang",
      "ar",
    );
    await expect(navigation).toHaveCount(8);
    await expect(navigation).toContainText([
      "المعلومات الشخصية",
      "الملف المهني",
      "الصورة الشخصية",
      "مواعيد العمل",
      "الإشعارات",
      "الأمان وكلمة المرور",
      "الجلسات والأجهزة",
      "تفضيلات الحساب",
    ]);

    await page.getByRole("button", { name: /مواعيد العمل/ }).click();
    await expect(
      page.getByRole("heading", { name: "جدول العمل الأسبوعي" }),
    ).toBeVisible();
    await expect(page.getByText("Africa/Algiers")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".doctor-settings-layout")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
    expect(errors).toEqual([]);

    await page.goto("/en/doctor/specialist/settings");
    await expect(page.locator(".doctor-settings-shell")).toHaveAttribute(
      "dir",
      "ltr",
    );
    await expect(page.locator(".doctor-settings-shell")).toHaveAttribute(
      "lang",
      "en",
    );
  });

  test("warns before leaving with unsaved personal changes", async ({
    page,
  }) => {
    const name = page.locator('input[autocomplete="name"]');
    const original = await name.inputValue();
    await name.fill(`${original} `);
    await expect(page.getByText("لديك تغييرات غير محفوظة.")).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("beforeunload");
      await dialog.dismiss();
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 5_000 }).catch(
      () => undefined,
    );
    await expect(
      page.getByRole("heading", { name: "إعدادات حساب الطبيب" }),
    ).toBeVisible();
  });
});
