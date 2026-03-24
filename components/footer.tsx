import { Github, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-2 flex items-center justify-between">
        <p className="font-bold text-muted-foreground hover:text-primary">khine.dev</p>
        <p className="text-center text-sm text-muted-foreground hover:text-primary">
          &copy; {new Date().getFullYear()} khine.dev All rights reserved.
        </p>
        <ul className="flex space-x-8">
          <li>
            <a href="https://github.com/williamKhine" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/williamkhine" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}