"use client";

import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

interface FooterProps {
  githubUrl?: string;
  linkedinUrl?: string;
}

export function Footer({
  githubUrl = "https://github.com/camilocbarrera/md-to-pdf",
  linkedinUrl = "https://www.linkedin.com/in/cristiancamilocorrea/",
}: FooterProps) {
  return (
    <footer className="border-t py-2 px-4 flex justify-between items-center bg-background">
      <div className="text-sm text-muted-foreground">Markdown PDF</div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => window.open(githubUrl, "_blank")}
          title="View on GitHub"
        >
          <Github className="h-4 w-4" />
          <span className="sr-only">GitHub</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => window.open(linkedinUrl, "_blank")}
          title="Contact on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="sr-only">LinkedIn</span>
        </Button>
      </div>
    </footer>
  );
}
