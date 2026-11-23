// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);

async function setup() {
  vi.stubEnv("OWNER_GITHUB_ID", "42");
  const t = convexTest(schema, modules);
  const { ownerId, visitorId } = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert("users", { name: "William" });
    const visitorId = await ctx.db.insert("users", { name: "William" });
    await ctx.db.insert("authAccounts", { userId: ownerId, provider: "github", providerAccountId: "42" });
    await ctx.db.insert("authAccounts", { userId: visitorId, provider: "github", providerAccountId: "43" });
    return { ownerId, visitorId };
  });
  return {
    t,
    owner: t.withIdentity({ subject: ownerId }),
    visitor: t.withIdentity({ subject: visitorId }),
  };
}

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

  await expect(owner.query(api.resumeReservations.list)).resolves.toEqual([]);
  await expect(owner.mutation(api.resumeReservations.save, {
    label: "New application", code: "Ab12Cd",
  })).rejects.toThrow("already in use");
  await expect(owner.mutation(api.resumeReservations.save, {
    id, label: "Published application", code: "Cd34Ef",
  })).rejects.toThrow("Published codes are locked");
});
