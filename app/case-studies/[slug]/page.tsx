import type { Metadata } from "next";
import { PortfolioLink } from "@/components/portfolio-navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { portfolioProjects } from "@/lib/portfolio-projects";
import { CaseStudyMarkdown } from "@/components/case-study-markdown";

export const dynamic = "force-dynamic";

type CaseStudyPageProps = { params: Promise<{ slug: string }> };

async function getProject(params: CaseStudyPageProps["params"]) {
  const { slug } = await params;
  const project = (await portfolioProjects()).find((project) => project.slug === slug);
  if (!project) notFound();

  return project;
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const project = await getProject(params);
  return { title: `${project.title} · ${project.sample ? "Sample Case Study" : "Case Study"}`, description: project.summary };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const project = await getProject(params);
  const sections = project.sample ? [
    { heading: "The problem", body: project.problem },
    { heading: "Proposed contribution", body: project.contribution },
    { heading: "Technical trade-off", body: project.tradeoff },
    { heading: "Outcome and measurement", body: project.outcome },
  ] : [];

  return (
    <main id="main" className="shell">
      <article className="case-study">
        <header>
          <PortfolioLink className="study-link back-link" href="/#work"><ArrowLeft aria-hidden="true" size={16} /> All Case Studies</PortfolioLink>
          {project.sample && <Badge variant="secondary">Sample Case Study</Badge>}
          <h1>{project.title}</h1>
          <p className="intro">{project.summary}</p>
        </header>
        {!project.sample && <CaseStudyMarkdown markdown={project.markdown} />}
        {sections.map(({ heading, body }) => (
          <section className="case-section section-rule" key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
