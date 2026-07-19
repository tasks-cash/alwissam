import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_OWNER_EMAIL || "";
const password = process.env.PLAYWRIGHT_OWNER_PASSWORD || "";

test.describe("Operational admin CRUD experience", () => {
  test.skip(!email || !password, "Owner credentials not provided via env");

  test.beforeEach(async ({ page }) => {
    await page.goto("/ar/auth/login");
    await page.fill("#identifier", email);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/ar\/doctor\/specialist\/dashboard/, {
      timeout: 30_000,
    });
  });

  test("doctor creation is multi-step, responsive, and protects unsaved data", async ({
    page,
  }) => {
    await page.goto("/ar/doctor/specialist/doctors");
    await expect(page.getByRole("heading", { name: "إدارة الأطباء" })).toBeVisible();
    await expect(page.getByRole("button", { name: /إضافة طبيب/ })).toBeVisible();

    await page.getByRole("button", { name: /إضافة طبيب/ }).first().click();
    const dialog = page.getByRole("dialog", { name: "إضافة طبيب جديد" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".admin-stepper li")).toHaveCount(5);

    await dialog.getByRole("button", { name: "التالي" }).click();
    await expect(dialog.getByText("أدخل الاسم الكامل للطبيب.")).toBeVisible();

    await dialog.getByLabel("الاسم الكامل").fill("طبيب اختبار واجهة");
    await dialog.getByLabel("البريد الإلكتروني").fill("ui-doctor@example.com");
    await dialog.getByLabel("رقم الهاتف").fill("0550000099");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog.locator(".admin-dialog-panel")).toHaveCSS("height", "844px");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    const discard = page.getByRole("alertdialog", { name: "تغييرات غير محفوظة" });
    await expect(discard).toBeVisible();
    await discard.getByRole("button", { name: "متابعة التعديل" }).click();
    await expect(dialog.getByLabel("الاسم الكامل")).toHaveValue("طبيب اختبار واجهة");
  });

  test("all operational content CRUD pages use the shared professional dialog", async ({
    page,
  }) => {
    const pages = [
      {
        path: "services",
        title: "إدارة الخدمات",
        action: /إضافة خدمة/,
        dialog: "إضافة خدمة",
      },
      {
        path: "specialties",
        title: "إدارة التخصصات",
        action: /إضافة تخصص/,
        dialog: "إضافة تخصص",
      },
      {
        path: "reviews",
        title: "إدارة التقييمات",
        action: /إنشاء مسودة تقييم/,
        dialog: "إنشاء مسودة تقييم",
      },
      {
        path: "faqs",
        title: "إدارة الأسئلة الشائعة",
        action: /إضافة سؤال/,
        dialog: "إضافة سؤال شائع",
      },
      {
        path: "before-after",
        title: "حالات قبل وبعد",
        action: /إضافة حالة/,
        dialog: "إضافة حالة قبل وبعد",
      },
    ];

    for (const item of pages) {
      await page.goto(`/ar/doctor/specialist/public-content/${item.path}`);
      await expect(page.getByRole("heading", { name: item.title })).toBeVisible();
      await page.getByRole("button", { name: item.action }).first().click();
      const dialog = page.getByRole("dialog", { name: item.dialog });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator(".admin-dialog-footer")).toBeVisible();
      await dialog.getByRole("button", { name: "إغلاق" }).click();
    }
  });

  test("Arabic dialogs are RTL and English dialogs remain LTR", async ({ page }) => {
    await page.goto("/ar/doctor/specialist/doctors");
    await page.getByRole("button", { name: /إضافة طبيب/ }).first().click();
    await expect(page.locator(".admin-dialog-backdrop")).toHaveAttribute("dir", "rtl");
    await page.getByRole("button", { name: "إغلاق" }).click();

    await page.goto("/en/doctor/specialist/doctors");
    await page.getByRole("button", { name: /إضافة طبيب/ }).first().click();
    await expect(page.locator(".admin-dialog-backdrop")).toHaveAttribute("dir", "ltr");
  });
});
