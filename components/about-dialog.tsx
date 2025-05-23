"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, Linkedin } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  githubUrl: string;
  linkedinUrl: string;
}

export function AboutDialog({ open, onOpenChange, githubUrl, linkedinUrl }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Markdown PDF</DialogTitle>
          <DialogDescription>
            A client-side Markdown to PDF converter with live preview
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            Markdown PDF is an open-source tool that allows you to write Markdown with a live
            preview and export to PDF. All processing happens in your browser - no data is sent to
            any server.
          </p>

          <h3 className="font-medium text-sm">Features:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Split-pane editor with live preview</li>
            <li>Support for tables, code blocks, and Mermaid diagrams</li>
            <li>One-click PDF export</li>
            <li>Client-side document storage</li>
            <li>Dark/light theme support</li>
          </ul>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Markdown PDF
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.open(githubUrl, "_blank")}
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.open(linkedinUrl, "_blank")}
              >
                <Linkedin className="h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
