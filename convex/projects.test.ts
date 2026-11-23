// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { afterEach, expect, test, vi } from "vitest";
import { setupPortfolioTest } from "../tests/support/convex";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);
afterEach(() => vi.unstubAllEnvs());

test("Project changes require owner access and the public API only returns published Projects in homepage order", async () => {
  const { t, owner, visitor } = await setupPortfolioTest(schema, modules);
  const project = { title: "Dashboard", slug: "dashboard", summary: "A full-stack project.", markdown: "## The problem" };
  for (const client of [t, visitor]) {
    await expect(client.query(api.projects.list)).rejects.toThrow("Owner access required");
    await expect(client.mutation(api.projects.save, project)).rejects.toThrow("Owner access required");
  }

  const first = await owner.mutation(api.projects.save, project);
  const second = await owner.mutation(api.projects.save, { ...project, title: "Second", slug: "second" });
  await expect(t.query(api.projects.published)).resolves.toEqual([]);
  await owner.mutation(api.projects.setPublished, { id: first, published: true });
  await owner.mutation(api.projects.setPublished, { id: second, published: true });
  await owner.mutation(api.projects.move, { id: second, direction: "up" });
  await expect(t.query(api.projects.published)).resolves.toMatchObject([{ _id: second }, { _id: first }]);
  await owner.mutation(api.projects.setPublished, { id: first, published: false });
  await expect(t.query(api.projects.published)).resolves.toMatchObject([{ _id: second }]);
});
