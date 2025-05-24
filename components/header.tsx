"use client";

import { AboutDialog } from "@/components/about-dialog";
import { PdfExportButton } from "@/components/pdf-export-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileText, Info, Keyboard } from "lucide-react";
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
      <header className="flex items-center justify-between h-10 px-2 border-b transition-ultra" role="banner">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium truncate whitespace-nowrap leading-tight" role="img" aria-label="Markdown to PDF Converter">.md to .pdf</span>
        </div>
        <nav className="flex items-center gap-1 flex-shrink-0" aria-label="Main navigation">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 transition-ultra" 
            onClick={() => setShowAbout(true)}
            aria-label="About this application"
          >
            <Info className="h-3 w-3" aria-hidden="true" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 px-2 text-xs transition-ultra" 
            onClick={onShowKeyboardShortcuts}
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="h-3 w-3 mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">⌘K</span>
          </Button>
          <PdfExportButton documentTitle={documentTitle} />
          <ThemeToggle />
        </nav>
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
