import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "@fontsource-variable/geist";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "William Khine · Full-stack developer", template: "%s · William Khine" },
  description: "William Khine’s developer portfolio and sample Case Studies.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="wordmark" href="/">
              <span className="monogram" aria-hidden="true">wk.</span> William Khine
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/#work">Case Studies</Link>
              <Link href="/#contact">Contact</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="shell"><Link href="/">William Khine</Link></div>
        </footer>
      </body>
    </html>
  );
}
