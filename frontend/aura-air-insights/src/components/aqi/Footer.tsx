import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AQI Forecasting System
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}