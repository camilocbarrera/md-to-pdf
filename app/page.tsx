"use client";

import { CommandPalette } from "@/components/command-palette";
import { Editor } from "@/components/editor";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { Preview } from "@/components/preview";
import { Resizable } from "@/components/resizable";
import { Sidebar } from "@/components/sidebar";
import { getDocument, getDocuments, saveDocument } from "@/lib/storage";
import type { DocumentType } from "@/lib/types";
import { FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentType>({
    id: "welcome",
    title: "Welcome",
    content:
      '# Welcome to Markdown PDF\n\nStart editing this document or create a new one.\n\n## Features\n\n- **Live Preview**: See your changes in real-time\n- **Export to PDF**: Generate a PDF with one click\n- **Local Storage**: All your documents are stored locally\n- **Markdown Support**: Full markdown support including tables, code blocks, and more\n- **Search**: Press Ctrl/Cmd+K to search across all documents\n\n## Example Table\n\n| Feature | Description |\n| ------- | ----------- |\n| Markdown | Full markdown support |\n| PDF Export | Export to PDF with one click |\n| Local Storage | All documents stored locally |\n| Search | Quick search with Ctrl/Cmd+K |\n\n## Example Code Block\n\n```javascript\nfunction hello() {\n  console.log("Hello, world!");\n}\n```\n\n## Example Mermaid Diagram\n\n```mermaid\ngraph TD;\n    A[Start] --> B[Process];\n    B --> C[End];\n```',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // GitHub and LinkedIn URLs - replace with your own
  const githubUrl = "https://github.com/camilocbarrera/md-to-pdf";
  const linkedinUrl = "https://www.linkedin.com/in/cristiancamilocorrea/";

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("Error", {
          description: "Failed to load documents from storage.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const handleDocumentChange = (content: string) => {
    const updatedDoc = {
      ...currentDocument,
      content,
      updatedAt: new Date().toISOString(),
    };
    setCurrentDocument(updatedDoc);
    saveDocument(updatedDoc).catch((error) => {
      console.error("Error saving document:", error);
    });
  };

  const handleDocumentSelect = async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (doc) {
        setCurrentDocument(doc);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      toast.error("Error", {
        description: "Failed to load the selected document.",
      });
    }
  };

  const handleCreateDocument = () => {
    const newDoc: DocumentType = {
      id: `doc-${Date.now()}`,
      title: "Untitled Document",
      content: "# Untitled Document\n\nStart writing your content here...",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentDocument(newDoc);
    saveDocument(newDoc)
      .then(() => {
        getDocuments().then(setDocuments).catch(console.error);
      })
      .catch(console.error);
  };

  const refreshDocuments = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error refreshing documents:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            saveDocument(currentDocument)
              .then(() => {
                toast.success("Document Saved", {
                  description: "Your document has been saved.",
                });
                refreshDocuments();
              })
              .catch(console.error);
            break;
          case "b":
            e.preventDefault();
            setSidebarOpen(!sidebarOpen);
            break;
          case "k":
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentDocument, sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading Markdown PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          currentDocumentId={currentDocument.id}
          onDocumentSelect={handleDocumentSelect}
          onCreateDocument={handleCreateDocument}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <Header
            documentTitle={currentDocument.title}
            onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            githubUrl={githubUrl}
            linkedinUrl={linkedinUrl}
          />
          <Resizable direction="horizontal" defaultSize={50} className="flex-1 overflow-hidden">
            <Editor value={currentDocument.content} onChange={handleDocumentChange} />
            <Preview markdown={currentDocument.content} />
          </Resizable>
        </div>
      </div>

      <Footer githubUrl={githubUrl} linkedinUrl={linkedinUrl} />

      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        documents={documents}
        currentDocumentId={currentDocument.id}
        onDocumentSelect={handleDocumentSelect}
        onCreateDocument={handleCreateDocument}
      />

      <Toaster />
    </div>
  );
}
