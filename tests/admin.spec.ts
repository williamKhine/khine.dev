import { expect, test } from "@playwright/test";
import { applicationPdf } from "./support/pdf";

test("the owner dashboard offers GitHub sign-in without exposing reservations", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Owner dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
  await expect(page.getByLabel("Application label")).toHaveCount(0);
});

test("an unavailable code leaves the portfolio and contact accessible", async ({ page }) => {
  await page.goto("/?code=not-a-code");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\?code=not-a-code$/);
  await expect(page.getByText("This résumé link is unavailable.")).toBeVisible();
  await expect(page.getByRole("link", { name: /résumé/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "william@khine.dev" })).toBeVisible();
  const pdf = await page.request.get("/api/resume?code=not-a-code");
  expect(pdf.status()).toBe(404);
  expect(pdf.headers()["cache-control"]).toContain("no-store");
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

test("the owner can preview, publish, reorder and unpublish Projects", async ({ browser, page: publicPage, baseURL }) => {
  const storageState = process.env.PLAYWRIGHT_OWNER_STATE;
  test.skip(!storageState, "Requires a disposable deployment with no published Projects and an owner browser state.");
  const context = await browser.newContext({ storageState, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    const projects = page.getByRole("list", { name: "Projects" });
    const suffix = Date.now().toString(36);
    const slugs = [`first-${suffix}`, `second-${suffix}`];
    const titles = [`First Project ${suffix}`, `Second Project ${suffix}`];

    for (const [index, slug] of slugs.entries()) {
      const form = page.getByRole("form", { name: "New Project" });
      await form.getByLabel("Project title").fill(titles[index]);
      await form.getByLabel("URL slug").fill(slug);
      await form.getByLabel("Summary").fill("An example for the publishing flow.");
      await form.getByLabel("Case Study Markdown").fill("## The problem\n\nRead the **working draft**.");
      await form.getByRole("button", { name: "Preview Case Study" }).click();
      await expect(form.getByRole("heading", { name: "The problem" })).toBeVisible();
      await form.getByRole("button", { name: "Create draft" }).click();
      await expect(projects.getByRole("heading", { name: titles[index] })).toBeVisible();
      expect((await publicPage.goto(`/case-studies/${slug}`))?.status()).toBe(404);
    }

    await publicPage.goto("/");
    await expect(publicPage.getByText("Sample Case Study", { exact: true })).toHaveCount(2);
    const row = (title: string) => projects.getByRole("listitem").filter({ hasText: title });
    for (const title of titles) await row(title).getByRole("button", { name: "Publish Project", exact: true }).click();
    await row(titles[1]).getByRole("button", { name: "Move up" }).click();
    const publicRows = projects.getByRole("listitem").filter({
      has: page.getByRole("button", { name: "Unpublish Project", exact: true }),
    });
    await expect(publicRows.getByRole("heading")).toHaveText([...titles].reverse());
    await publicPage.goto("/");
    await expect(publicPage.locator("#work h3")).toHaveText([...titles].reverse());
    await expect(publicPage.getByText("Sample Case Study", { exact: true })).toHaveCount(0);
    await publicPage.getByRole("link", { name: `Read the ${titles[0]} Case Study` }).click();
    await expect(publicPage.getByRole("heading", { name: "The problem" })).toBeVisible();

    for (const title of titles) await row(title).getByRole("button", { name: "Unpublish Project" }).click();
    for (const title of titles) await expect(row(title).getByText(/^Draft ·/)).toBeVisible();
    await publicPage.goto("/");
    await expect(publicPage.getByText("Sample Case Study", { exact: true })).toHaveCount(2);
  } finally {
    await context.close();
  }
});

test("an unauthenticated recipient can follow a coded link and open the matching PDF until revocation", async ({ browser, page: recipient, baseURL }) => {
  const storageState = process.env.PLAYWRIGHT_OWNER_STATE;
  test.skip(!storageState, "Requires a signed-in owner browser state for a disposable deployment.");
  const context = await browser.newContext({ storageState, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    const form = page.getByRole("form", { name: "Reserve a Résumé Code" });
    async function reserve(application: string) {
      await form.getByRole("button", { name: "Generate code" }).click();
      const code = await form.getByLabel("Résumé Code", { exact: true }).inputValue();
      const label = `${application} ${code}`;
      await form.getByLabel("Application label").fill(label);
      await form.getByRole("button", { name: "Reserve code" }).click();
      const row = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: label, exact: true }) });
      return { code, row };
    }

    const { code: originalCode, row } = await reserve("Shared application");
    const publishButton = row.getByRole("button", { name: "Publish résumé" });
    const pdf = Buffer.from(await applicationPdf("Tailored application fixture"));
    const otherPdf = Buffer.from(await applicationPdf("Second application fixture"));
    async function upload(target: typeof row, buffer: Buffer) {
      await target.getByLabel("Résumé PDF").setInputFiles({ name: "application.pdf", mimeType: "application/pdf", buffer });
      await target.getByRole("button", { name: "Upload PDF" }).click();
      await expect(target.getByText("PDF attached", { exact: true })).toBeVisible();
    }

    await upload(row, otherPdf);
    await row.getByRole("button", { name: "Edit", exact: true }).click();
    const code = `${originalCode.slice(0, -1)}${originalCode.endsWith("A") ? "F" : "A"}`;
    const edit = page.getByRole("form", { name: "Edit reservation" });
    await edit.getByLabel("Résumé Code", { exact: true }).fill(code);
    await edit.getByRole("button", { name: "Save changes" }).click();
    await expect(row.getByText("Reserved · upload the PDF")).toBeVisible();
    await expect(publishButton).toHaveCount(0);
    await upload(row, pdf);
    await publishButton.click();
    await expect(row.getByText("Published", { exact: true })).toBeVisible();

    const other = await reserve("Second application");
    await upload(other.row, otherPdf);
    await other.row.getByRole("button", { name: "Publish résumé" }).click();
    await expect(other.row.getByText("Published", { exact: true })).toBeVisible();
    const otherResponse = await recipient.request.get(`/api/resume?code=${other.code}`);
    expect(otherResponse.status()).toBe(200);
    expect(await otherResponse.body()).toEqual(otherPdf);
    expect((await recipient.request.get(`/api/resume?code=${originalCode}`)).status()).toBe(404);

    await recipient.goto(`/?code=${code}`);
    const action = recipient.getByRole("link", { name: "Open Résumé (PDF)" });
    await expect(action).toBeVisible();
    await recipient.getByRole("link", { name: /^Read the .* Case Study$/ }).first().click();
    await expect(action).toBeVisible();
    const endpoint = (await action.getAttribute("href"))!;
    const pdfNavigation = recipient.waitForResponse((response) => new URL(response.url()).pathname === "/api/resume" && response.status() === 200);
    await action.click();
    expect((await pdfNavigation).headers()["content-type"]).toBe("application/pdf");
    const response = await recipient.request.get(endpoint);
    expect(response.status()).toBe(200);
    expect(await response.body()).toEqual(pdf);
    await recipient.goto("/");
    await expect(action).toHaveCount(0);

    await row.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(row.getByText("Archived · link active")).toBeVisible();
    expect((await recipient.request.get(endpoint)).status()).toBe(200);
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Revoke code" }).click();
    await expect(row.getByText("Revoked", { exact: true })).toBeVisible();
    expect((await recipient.request.get(endpoint)).status()).toBe(404);
    await other.row.getByRole("button", { name: "Archive", exact: true }).click();
    await expect(other.row.getByText("Archived · link active")).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await other.row.getByRole("button", { name: "Revoke code" }).click();
    await expect(other.row.getByText("Revoked", { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
