import { ProjectCard } from "@/components/project-card"

const projects = [
  {
    title: "USSTM Website",
    description: "A website for the Undergraduate Science Society of Toronto Metropolitan University built with Next.js(TypeScript), Tailwind CSS and Supabase.",
    link: "https://usstm.ca/",
    github: "https://github.com/pacs-tmu/usstm-website",
    image: "/usstm.png",
  },
  {
    title: "Project 2",
    description: "Description for Project 2.",
    link: "#",
    github: "#",
    image: "/usstm.png",
  },
  {
    title: "Project 3",
    description: "Description for Project 3.",
    link: "#",
    github: "#",
    image: "/usstm.png",
  },
]

export function Projects() {
  return (
    <section id="projects" className="h-dvh">
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  )
}
