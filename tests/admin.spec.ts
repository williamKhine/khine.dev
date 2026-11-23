import { expect, test } from "@playwright/test";

test("the owner dashboard offers GitHub sign-in without exposing reservations", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Owner dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
  await expect(page.getByLabel("Application label")).toHaveCount(0);
});

test("a portfolio URL with a code does not expose a résumé", async ({ page }) => {
  await page.goto("/?code=Ab12Cd");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\?code=Ab12Cd$/);
  await expect(page.getByRole("link", { name: /résumé/i })).toHaveCount(0);
});

test("a signed-in visitor cannot open the reservation dashboard", async ({ browser, baseURL }) => {
  const storageState = process.env.PLAYWRIGHT_VISITOR_STATE;
  test.skip(!storageState, "Requires a signed-in non-owner browser state.");
  const context = await browser.newContext({ storageState, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Owner access required.");
    await expect(page.getByLabel("Application label")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("the owner can reserve, edit and copy the canonical link before upload", async ({ browser, baseURL }) => {
  const storageState = process.env.PLAYWRIGHT_OWNER_STATE;
  test.skip(!storageState, "Requires a signed-in owner browser state for a disposable deployment.");
  const context = await browser.newContext({ storageState, baseURL, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    const code = page.getByLabel("Résumé Code", { exact: true });
    await page.getByRole("button", { name: "Generate code" }).click();
    await expect(code).toHaveValue(/^[a-f0-9]{6}$/);
    const generated = await code.inputValue();
    const label = `Application ${generated}`;
    const customCode = `Ab${generated.slice(2)}`;
    await page.getByLabel("Application label").fill(label);
    await code.fill("XYZ123");
    await page.getByRole("button", { name: "Reserve code" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("six hexadecimal characters");
    await code.fill(customCode);
    await page.getByRole("button", { name: "Reserve code" }).click();

    const reservation = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: label, exact: true }) });
    await expect(reservation.getByRole("textbox")).toHaveValue(`https://khine.dev/?code=${customCode}`);
    await reservation.getByRole("button", { name: "Edit", exact: true }).click();
    await code.fill(customCode.toLowerCase());
    await page.getByRole("button", { name: "Save changes" }).click();
    const url = `https://khine.dev/?code=${customCode.toLowerCase()}`;
    await expect(reservation.getByRole("textbox")).toHaveValue(url);
    await reservation.getByRole("button", { name: "Copy link" }).click();
    await expect(reservation.getByRole("status")).toHaveText("Link copied.");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  } finally {
    await context.close();
  }
});

test("the GitHub sign-in button starts the OAuth flow", async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_VERIFY_GITHUB_REDIRECT, "Requires Convex GitHub OAuth configuration.");
  await page.route("**/api/auth/signin/github?*", async (route) => {
    const response = await route.fetch({ maxRedirects: 0 });
    const destination = response.headers().location;
    await route.fulfill({ body: destination ?? "Missing redirect" });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await expect(page.locator("body")).toContainText("https://github.com/login/oauth/authorize?");
});
