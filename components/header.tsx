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
      <header className="flex items-center justify-between h-10 px-2 border-b transition-ultra">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <h1 className="text-sm font-medium truncate whitespace-nowrap leading-tight">.md to .pdf</h1>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 transition-ultra" onClick={() => setShowAbout(true)}>
            <Info className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs transition-ultra" onClick={onShowKeyboardShortcuts}>
            <Keyboard className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">⌘K</span>
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
