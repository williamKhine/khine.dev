import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Contact } from "@/components/contact";
import { FadeContent } from "@/components/fade-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import projects from "@/content/sample-projects.json";

export default function Home() {
  return (
    <main id="main" className="shell">
      <section className="hero" aria-labelledby="intro">
        <FadeContent>
          <p className="eyebrow">Full-stack developer</p>
          <h1 id="intro">Hi, I’m William.<br />I build <em>for the web.</em></h1>
          <p className="intro">
            I work across interfaces, APIs, and databases, with a focus on making complex workflows easier to use.
          </p>
          <Button asChild size="lg" className="hero-action">
            <a href="#work">Browse Case Studies <ArrowDown aria-hidden="true" /></a>
          </Button>
        </FadeContent>
      </section>

      <section id="work" className="work section-rule" aria-labelledby="work-heading">
        <header className="section-heading">
          <h2 id="work-heading">Case Studies</h2>
          <p>Two fictional projects exploring full-stack design decisions.</p>
        </header>
        <FadeContent>
          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.slug} className="project-card">
                <div className={`project-art project-art--${project.illustration}`} aria-hidden="true">
                  <div className="art-window">
                    <div className="art-toolbar"><i /><i /><i /></div>
                    <div className="art-body"><i /><i /><i /><i /></div>
                  </div>
                </div>
                <div className="project-details">
                  <Badge variant="secondary">Sample Case Study</Badge>
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="project-summary">{project.summary}</p>
                  <Link
                    href={`/case-studies/${project.slug}`}
                    aria-label={`Read the ${project.title} Case Study`}
                    className="study-link"
                  >
                    Read Case Study <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </FadeContent>
      </section>

      <section id="contact" className="contact section-rule" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Get in touch</h2>
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
