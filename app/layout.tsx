import type { Metadata } from "next";
import { PortfolioLink, PortfolioResumeAction } from "@/components/portfolio-navigation";
import type { ReactNode } from "react";
import "@fontsource-variable/geist";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "William Khine · Full-stack developer", template: "%s · William Khine" },
  description: "William Khine’s developer portfolio and Case Studies.",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="shell header-inner">
            <PortfolioLink className="wordmark" href="/">
              <span className="monogram" aria-hidden="true">wk.</span> William Khine
            </PortfolioLink>
            <nav aria-label="Main navigation">
              <PortfolioLink href="/#work">Case Studies</PortfolioLink>
              <PortfolioLink href="/#contact">Contact</PortfolioLink>
            </nav>
          </div>
          <PortfolioResumeAction />
        </header>
        {children}
        <footer className="site-footer">
          <div className="shell"><PortfolioLink href="/">William Khine</PortfolioLink></div>
        </footer>
      </body>
    </html>
  );
}
