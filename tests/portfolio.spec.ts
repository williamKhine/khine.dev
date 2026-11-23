import { expect, test } from "@playwright/test";

test("visitors can open each sample Case Study and return to the homepage", async ({ page }) => {
  await page.goto("/");
  for (const [title, path] of [
    ["Relay", "/case-studies/relay"],
    ["Ledger", "/case-studies/ledger"],
  ]) {
    await page.getByRole("link", { name: `Read the ${title} Case Study` }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByText("Sample Case Study", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "All Case Studies" }).click();
    await expect(page).toHaveURL("/#work");
  }

  expect((await page.goto("/case-studies/unknown"))?.status()).toBe(404);
});

test.describe("narrow viewport with reduced motion", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });

  test("visitors can find and copy contact details and browse sample work", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hi, I’m William.");
    await expect(page.getByText("Full-stack developer", { exact: true })).toBeVisible();
    await expect(page.getByText("Sample Case Study", { exact: true })).toHaveCount(2);

    await page.getByRole("navigation").getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/#contact");
    await expect(page.getByRole("link", { name: "william@khine.dev" })).toHaveAttribute("href", "mailto:william@khine.dev");
    await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/williamKhine");
    await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/williamkhine");
    await page.getByRole("button", { name: "Copy email address" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Email copied." })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("william@khine.dev");

    await page.getByRole("link", { name: "Read the Ledger Case Study" }).click();
    await expect(page).toHaveURL("/case-studies/ledger");
    await expect(page.getByRole("heading", { name: "Technical trade-off" })).toBeVisible();
    await expect(page.getByText("Sample Case Study", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "All Case Studies" }).click();
    await expect(page).toHaveURL("/#work");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
