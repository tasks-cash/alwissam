import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Staff chat floating button — CSS contract from source.
 * Runtime auth UI is covered by Nest staff-chat unit tests.
 */
test.describe("Staff Chat floating button", () => {
  const cssPath = join(__dirname, "../app/globals.css");
  const css = readFileSync(cssPath, "utf8");

  test("staff-chat FAB CSS is bottom-left fixed (physical left, RTL included)", () => {
    expect(css).toContain(".staff-chat-fab");
    expect(css).toMatch(/\.staff-chat-fab\s*\{[\s\S]*?position:\s*fixed/);
    expect(css).toMatch(/\.staff-chat-fab\s*\{[\s\S]*?left:\s*max\(/);
    expect(css).toMatch(/\.staff-chat-fab\s*\{[\s\S]*?right:\s*auto/);
    expect(css).toMatch(/\.staff-chat-fab\s*\{[\s\S]*?bottom:/);
  });

  test("staff-chat panel opens from the left side", () => {
    expect(css).toMatch(/\.staff-chat-panel\s*\{[\s\S]*?left:\s*1rem/);
    expect(css).toMatch(/\.staff-chat-panel\s*\{[\s\S]*?right:\s*auto/);
  });

  test("desktop staff-chat panel uses compact enlarged width", () => {
    expect(css).toMatch(
      /\.staff-chat-panel\s*\{[\s\S]*?width:\s*min\(420px/,
    );
    expect(css).toMatch(
      /\.staff-chat-panel\s*\{[\s\S]*?min-height:\s*min\(520px/,
    );
    expect(css).toMatch(
      /\.staff-chat-panel\s*\{[\s\S]*?max-height:\s*min\(76vh/,
    );
    expect(css).not.toMatch(
      /\.staff-chat-panel\s*\{[\s\S]*?width:\s*min\(920px/,
    );
  });

  test("mobile chat panel uses full-screen rules", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*720px\)/);
    expect(css).toContain(".staff-chat-panel");
    expect(css).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.staff-chat-panel\s*\{[\s\S]*?inset:\s*0/,
    );
  });

  test("accessible open label exists in widget source", () => {
    const widget = readFileSync(
      join(__dirname, "../components/staff/StaffChatWidget.tsx"),
      "utf8",
    );
    expect(widget).toContain('aria-label="فتح دردشة الطاقم"');
    expect(widget).toContain("دردشة الطاقم");
  });
});
