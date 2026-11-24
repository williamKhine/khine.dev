import { fetchQuery } from "convex/nextjs";
import { cache } from "react";
import samples from "@/content/sample-projects.json";
import { api } from "@/convex/_generated/api";

export const portfolioProjects = cache(async () => {
  const published = process.env.NEXT_PUBLIC_CONVEX_URL
    ? await fetchQuery(api.projects.published, {})
    : [];
  return published.length
    ? published.map(({ slug, title, summary, markdown }) => ({ slug, title, summary, markdown, sample: false as const }))
    : samples.map((sample) => ({ ...sample, sample: true as const }));
});
