import Markdown, { type Components } from "react-markdown";
import { PortfolioLink } from "./portfolio-navigation";

const markdownComponents: Components = {
  h1: "h2",
  a: ({ href, children, title }) => {
    if (href && !href.startsWith("#")) {
      return <PortfolioLink href={href} title={title}>{children}</PortfolioLink>;
    }
    return <a href={href} title={title}>{children}</a>;
  },
};

export function CaseStudyMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="case-markdown">
      <Markdown components={markdownComponents} skipHtml>{markdown}</Markdown>
    </div>
  );
}
