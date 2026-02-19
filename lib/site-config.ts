export const siteConfig = {
  name: "Mermaidify",
  title: {
    default: "Mermaidify",
    template: "%s | Mermaidify",
  },
  description:
    "Create beautiful Mermaid diagrams with a powerful online editor. Build flowcharts, ER diagrams, sequence diagrams, class diagrams, and more — all from code.",
  url: "https://mermaidify.vercel.app",
  keywords: [
    "mermaid",
    "diagram",
    "flowchart",
    "editor",
    "sequence diagram",
    "ER diagram",
    "class diagram",
    "diagram as code",
    "mermaid editor",
    "online diagram tool",
  ],
  author: {
    name: "Mermaidify",
    url: "https://mermaidify.vercel.app",
  },
  creator: "Mermaidify",
  openGraph: {
    type: "website" as const,
    locale: "en_US",
    siteName: "Mermaidify",
  },
  twitter: {
    card: "summary_large_image" as const,
  },
} as const;
