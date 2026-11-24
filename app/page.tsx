import { PortfolioLink } from "@/components/portfolio-navigation";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Contact } from "@/components/contact";
import { FadeContent } from "@/components/fade-content";
import { StackFigure } from '@/components/stack-figure';
import { ProjectPreview } from '@/components/project-preview';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { portfolioProjects } from "@/lib/portfolio-projects";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await portfolioProjects();
  return (
    <main id="main" className="shell">
      <section className="hero" aria-labelledby="intro">
        <FadeContent>
          <p className="eyebrow">Full-stack developer</p>
          <h1 id="intro">Hi, I’m William.<span>I build for the web.</span></h1>
          <p className="intro">
            I work across interfaces, APIs, and databases, with a focus on making complex workflows easier to use.
          </p>
          <div className="hero-actions"><Button asChild size="lg">
            <a href="#work">View case studies <ArrowDown aria-hidden="true" /></a>
          </Button><Button asChild variant="outline" size="lg"><a href="#contact">Get in touch <ArrowUpRight aria-hidden="true" /></a></Button></div>
        </FadeContent>
        <StackFigure />
      </section>

      <section id="work" className="work section-rule" aria-labelledby="work-heading">
        <header className="section-heading">
          <span className="section-label">01 / SELECTED WORK</span>
          <h2 id="work-heading">Case Studies<span className="work-count">{String(projects.length).padStart(2, '0')}</span></h2>
          {projects[0]?.sample && <p>Two fictional projects exploring full-stack design decisions.</p>}
        </header>
        <FadeContent>
          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.slug} className="project-card">
                {project.sample && <ProjectPreview chart={project.illustration === 'chart'} />}
                <div className="project-details">
                  {project.sample && <Badge variant="secondary">Sample Case Study</Badge>}
                  {project.sample && <p className="project-category">{project.category}</p>}
                  <h3>{project.title}</h3>
                  <p className="project-summary">{project.summary}</p>
                  <PortfolioLink
                    href={`/case-studies/${project.slug}`}
                    aria-label={`Read the ${project.title} Case Study`}
                    className="study-link"
                  >
                    Read Case Study <ArrowRight aria-hidden="true" size={16} />
                  </PortfolioLink>
                </div>
              </article>
            ))}
          </div>
        </FadeContent>
      </section>

      <section id="contact" className="contact section-rule" aria-labelledby="contact-heading">
        <div><span className="section-label">02 / CONTACT</span><h2 id="contact-heading">Get in touch</h2></div>
        <div>
          <Contact email="william@khine.dev" />
          <div className="social-links">
            <a href="https://github.com/williamKhine">GitHub <ArrowUpRight aria-hidden="true" size={14} /></a>
            <a href="https://www.linkedin.com/in/williamkhine">LinkedIn <ArrowUpRight aria-hidden="true" size={14} /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
