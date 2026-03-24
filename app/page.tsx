import { Hero } from "@/components/hero"
import { Projects } from "@/components/projects"
import { Experience } from "@/components/experience"
import { Contact } from "@/components/contact"

export default function Page() {
  return (
    <main className="flex-1">
      <Hero />
      <Projects />
      <Experience />
      <Contact />
    </main>
  )
}
