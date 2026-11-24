// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { setupPortfolioTest } from "../tests/support/convex";
import { applicationPdf } from "../tests/support/pdf";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);

async function setup() {
  vi.stubEnv("RESUME_PROXY_SECRET", "test-proxy-secret");
  return setupPortfolioTest(schema, modules);
}

const proxyHeaders = (client = "a") => ({
  Authorization: "Bearer test-proxy-secret",
  "X-Resume-Client": client.repeat(64),
});

afterEach(() => vi.unstubAllEnvs());

test("only the configured GitHub account can read or save reservations", async () => {
  const { t, owner, visitor } = await setup();
  for (const client of [t, visitor]) {
    await expect(client.query(api.owner.access)).resolves.toBe(false);
    await expect(client.query(api.resumeReservations.list)).rejects.toThrow("Owner access required");
    await expect(client.mutation(api.resumeReservations.save, {
      label: "Application",
      code: "Ab12Cd",
    })).rejects.toThrow("Owner access required");
  }

  await expect(owner.query(api.owner.access)).resolves.toBe(true);
  await expect(owner.query(api.resumeReservations.list)).resolves.toEqual([]);
  vi.stubEnv("OWNER_GITHUB_ID", "");
  await expect(owner.query(api.owner.access)).resolves.toBe(false);
});

test("editing a reservation preserves case and rejects collisions and malformed codes", async () => {
  const { owner } = await setup();
  const save = (label: string, code: string) => owner.mutation(api.resumeReservations.save, { label, code });

  for (const code of ["Ab12C", "Ab12CdE", "Ab12Cg", "Ab12C ", "Ab12C\n"]) {
    await expect(save("Application", code)).rejects.toThrow("six hexadecimal characters");
  }
  await expect(save("   ", "Ab12Cd")).rejects.toThrow("Enter an application label");

  const id = await save("First application", "Ab12Cd");
  await expect(save("Second application", "Ab12Cd")).rejects.toThrow("already in use");
  await save("Second application", "ab12cd");

  await expect(owner.mutation(api.resumeReservations.save, {
    id, label: "Renamed application", code: "ab12cd",
  })).rejects.toThrow("already in use");
  await owner.mutation(api.resumeReservations.save, { id, label: "Renamed application", code: "Ab12Cd" });
  await owner.mutation(api.resumeReservations.save, { id, label: "Renamed application", code: "Fe34Ab" });

  await expect(owner.query(api.resumeReservations.list)).resolves.toMatchObject([
    { label: "Second application", code: "ab12cd" },
    { _id: id, label: "Renamed application", code: "Fe34Ab" },
  ]);
  await save("Third application", "Ab12Cd");
});

test("previously published codes remain unavailable for reservation or editing", async () => {
  const { t, owner } = await setup();
  const id = await t.run((ctx) => ctx.db.insert("resumeVersions", {
    label: "Published application", code: "Ab12Cd", publishedAt: 1,
  }));

  await expect(owner.query(api.resumeReservations.list)).resolves.toMatchObject([{ _id: id, publishedAt: 1 }]);
  await expect(owner.mutation(api.resumeReservations.save, {
    label: "New application", code: "Ab12Cd",
  })).rejects.toThrow("already in use");
  await expect(owner.mutation(api.resumeReservations.save, {
    id, label: "Published application", code: "Cd34Ef",
  })).rejects.toThrow("Published codes are locked");
});

test("the public PDF endpoint serves only the exact active version and stops serving revoked codes", async () => {
  const { t, owner, visitor } = await setup();
  const pdf = await applicationPdf("First application");
  const otherPdf = await applicationPdf("Second application");
  const id = await owner.mutation(api.resumeReservations.save, { label: "First", code: "Ab12Cd" });
  const upload = { id, code: "Ab12Cd", revision: 0, bytes: pdf };

  for (const client of [t, visitor]) {
    await expect(client.action(api.resumeReservations.uploadPdf, upload)).rejects.toThrow("Owner access required");
  }

  const getPdf = (code: string) => t.fetch(`/resume?code=${code}`, { headers: proxyHeaders() });
  const malformed = new TextEncoder().encode("%PDF-1.7\nNot a document").buffer;
  await expect(owner.action(api.resumeReservations.uploadPdf, { ...upload, bytes: malformed })).rejects.toThrow("readable PDF");
  await owner.action(api.resumeReservations.uploadPdf, upload);
  expect((await getPdf("Ab12Cd")).status).toBe(404);

  const attached = (await owner.query(api.resumeReservations.list))[0].pdf!;
  await owner.mutation(api.resumeReservations.save, { id, label: "First", code: "Ab12Ce" });
  await expect(owner.mutation(api.resumeReservations.publish, { id, revision: 0, pdf: attached })).rejects.toThrow("changed");
  await expect(owner.action(api.resumeReservations.uploadPdf, upload)).rejects.toThrow("code changed");

  const second = await owner.mutation(api.resumeReservations.save, { label: "Second", code: "ab12ce" });
  await owner.action(api.resumeReservations.uploadPdf, { id, code: "Ab12Ce", revision: 1, bytes: pdf });
  await owner.action(api.resumeReservations.uploadPdf, { id: second, code: "ab12ce", revision: 0, bytes: otherPdf });
  for (const version of await owner.query(api.resumeReservations.list)) {
    await owner.mutation(api.resumeReservations.publish, {
      id: version._id, revision: version.codeRevision ?? 0, pdf: version.pdf!,
    });
  }

  expect((await t.fetch("/resume?code=Ab12Ce")).status).toBe(404);
  const first = await getPdf("Ab12Ce");
  expect(first.status).toBe(200);
  expect(first.headers.get("Content-Type")).toBe("application/pdf");
  expect(first.headers.get("Cache-Control")).toContain("no-store");
  expect(await first.arrayBuffer()).toEqual(pdf);
  expect(await (await getPdf("ab12ce")).arrayBuffer()).toEqual(otherPdf);
  expect((await getPdf("AB12CE")).status).toBe(404);
  expect((await t.fetch("/resume?code=Ab12Ce&check=1", { headers: proxyHeaders() })).status).toBe(204);
  await expect(owner.action(api.resumeReservations.uploadPdf, { ...upload, code: "Ab12Ce", revision: 1 })).rejects.toThrow("locked");

  await owner.mutation(api.resumeReservations.retire, { id, operation: "archive" });
  expect(await (await getPdf("Ab12Ce")).arrayBuffer()).toEqual(pdf);
  await owner.mutation(api.resumeReservations.retire, { id, operation: "revoke" });
  expect((await getPdf("Ab12Ce")).status).toBe(404);
  await expect(owner.mutation(api.resumeReservations.save, { label: "Third", code: "Ab12Ce" })).rejects.toThrow("already in use");
});

test("the public PDF endpoint slows repeated invalid lookups and recovers after the window", async () => {
  vi.useFakeTimers();
  try {
    const { t, owner } = await setup();
    const bytes = await applicationPdf("Archived application");
    const id = await owner.mutation(api.resumeReservations.save, { label: "Archived", code: "Ab12Cd" });
    await owner.action(api.resumeReservations.uploadPdf, { id, code: "Ab12Cd", revision: 0, bytes });
    const [version] = await owner.query(api.resumeReservations.list);
    await owner.mutation(api.resumeReservations.publish, { id, revision: 0, pdf: version.pdf! });
    await owner.mutation(api.resumeReservations.retire, { id, operation: "archive" });
    for (let attempt = 0; attempt < 30; attempt++) {
      const code = attempt.toString(16).padStart(6, "0");
      expect((await t.fetch(`/resume?code=${code}`, { headers: proxyHeaders() })).status).toBe(404);
    }
    const limited = await t.fetch("/resume?code=Ab12Cd", { headers: proxyHeaders() });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("60");
    const independentRecipient = await t.fetch("/resume?code=Ab12Cd", { headers: proxyHeaders("b") });
    expect(independentRecipient.status).toBe(200);
    expect(await independentRecipient.arrayBuffer()).toEqual(bytes);
    vi.setSystemTime(Date.now() + 60_001);
    expect((await t.fetch("/resume?code=Ab12Cd", { headers: proxyHeaders() })).status).toBe(200);
  } finally {
    vi.useRealTimers();
  }
});
