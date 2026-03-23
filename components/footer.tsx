export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-3 flex items-center justify-between">
        <p className="font-bold">khine.dev</p>
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} khine.dev All rights reserved.
        </p>
        <ul className="flex space-x-4">
          <li>
            <a href="https://github.com/williamKhine" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li>
            <a href="https://linkedin.com/in/williamkhine" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}