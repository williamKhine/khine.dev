import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Projects } from "@/components/projects"
import { Footer } from "@/components/footer"
import { Contact } from "@/components/contact"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>

        <Hero />
        <Projects />
        <Contact />

      </main>
      <Footer />
    </>

  )
}
