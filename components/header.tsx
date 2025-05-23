"use client";

import { AboutDialog } from "@/components/about-dialog";
import { PdfExportButton } from "@/components/pdf-export-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileText, Github, Info, Keyboard } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  documentTitle: string;
  onShowKeyboardShortcuts: () => void;
  githubUrl: string;
  linkedinUrl: string;
}

export function Header({
  documentTitle,
  onShowKeyboardShortcuts,
  githubUrl,
  linkedinUrl,
}: HeaderProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Markdown PDF</h1>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => window.open(githubUrl, "_blank")}
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)}>
            <Info className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">About</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onShowKeyboardShortcuts}>
            <Keyboard className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Shortcuts</span>
          </Button>
          <PdfExportButton documentTitle={documentTitle} />
          <ThemeToggle />
        </div>
      </header>

      <AboutDialog
        open={showAbout}
        onOpenChange={setShowAbout}
        githubUrl={githubUrl}
        linkedinUrl={linkedinUrl}
      />
    </>
  );
}
