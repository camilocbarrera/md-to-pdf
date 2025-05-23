"use client";

import { CommandPalette } from "@/components/command-palette";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { MobileEditor } from "@/components/mobile-editor";
import { MobileLayout } from "@/components/mobile-layout";
import { OptimizedPreview } from "@/components/optimized-preview";
import { Resizable } from "@/components/resizable";
import { Sidebar } from "@/components/sidebar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDocument, getDocuments, saveDocument } from "@/lib/storage";
import type { DocumentType } from "@/lib/types";
import { extractTitleFromContent } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [currentDocument, setCurrentDocument] = useState<DocumentType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserModifiedWelcome, setHasUserModifiedWelcome] = useState(false);
  const [shouldFocusEditor, setShouldFocusEditor] = useState(false);
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  // GitHub and LinkedIn URLs - replace with your own
  const githubUrl = "https://github.com/camilocbarrera/md-to-pdf";
  const linkedinUrl = "https://www.linkedin.com/in/cristiancamilocorrea/";

  // Debounce saving for better performance
  const debouncedDocument = useDebouncedValue(currentDocument, 1000);

  // Global keyboard listener - works even during loading
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case "b":
            if (!isLoading) {
              e.preventDefault();
              setSidebarOpen(prev => !prev);
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isLoading]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
        
        // Check if welcome document was previously deleted
        const welcomeDeleted = localStorage.getItem('welcomeDocumentDeleted') === 'true';
        
        // If no documents exist and welcome wasn't deleted, this is the first visit - show welcome document
        if (docs.length === 0 && !welcomeDeleted) {
          const welcomeDoc: DocumentType = {
            id: "welcome",
            title: "Welcome to Markdown to PDF",
            content:
              '# Welcome to Markdown to PDF\n\nStart editing this document or create a new one.\n\n## Features\n\n- **Live Preview**: See your changes in real-time\n- **Export to PDF**: Generate a PDF with one click\n- **Local Storage**: All your documents are stored locally\n- **Markdown Support**: Full markdown support including tables, code blocks, and more\n- **Search**: Press Ctrl/Cmd+K to search across all documents\n\n## Example Table\n\n| Feature | Description |\n| ------- | ----------- |\n| Markdown | Full markdown support |\n| PDF Export | Export to PDF with one click |\n| Local Storage | All documents stored locally |\n| Search | Quick search with Ctrl/Cmd+K |\n\n## Example Code Block\n\n```javascript\nfunction hello() {\n  console.log("Hello, world!");\n}\n```\n\n## Example Mermaid Diagram\n\n```mermaid\ngraph TD;\n    A[Start] --> B[Process];\n    B --> C[End];\n```',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentDocument(welcomeDoc);
          setShouldFocusEditor(true);
          return;
        }
        
        // If no documents exist but welcome was deleted, create a new default document
        if (docs.length === 0 && welcomeDeleted) {
          const defaultDoc: DocumentType = {
            id: `doc-${Date.now()}`,
            title: "New Document",
            content: "# New Document\n\nStart writing your content here...",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentDocument(defaultDoc);
          localStorage.setItem('lastOpenedDocument', defaultDoc.id);
          setShouldFocusEditor(true);
          return;
        }
        
        // Get the last opened document from localStorage
        const lastOpenedId = localStorage.getItem('lastOpenedDocument');
        let documentToLoad: DocumentType | undefined;
        
        if (lastOpenedId) {
          documentToLoad = docs.find(doc => doc.id === lastOpenedId);
        }
        
        // If no last opened document or it doesn't exist, get the most recently updated document
        if (!documentToLoad) {
          documentToLoad = docs.reduce((latest, current) => 
            new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
          );
        }
        
        if (documentToLoad) {
          setCurrentDocument(documentToLoad);
          setHasUserModifiedWelcome(documentToLoad.id === "welcome");
          setShouldFocusEditor(true);
        }
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

  // Auto-save all documents including welcome document
  useEffect(() => {
    if (!debouncedDocument || !debouncedDocument.content.trim()) return;
    
    // Update title based on content
    const autoTitle = extractTitleFromContent(debouncedDocument.content);
    const docToSave = {
      ...debouncedDocument,
      title: autoTitle,
    };
    
    // Save document and refresh list
    saveDocument(docToSave)
      .then(() => {
        // Update current document title if it changed
        if (docToSave.title !== currentDocument?.title) {
          setCurrentDocument(prev => prev ? { ...prev, title: autoTitle } : null);
        }
        
        // Store the last opened document
        localStorage.setItem('lastOpenedDocument', docToSave.id);
        
        // Refresh documents list to show updated title
        return getDocuments();
      })
      .then(setDocuments)
      .catch((error) => {
        console.error("Error auto-saving document:", error);
      });
  }, [debouncedDocument]);

  const handleDocumentChange = useCallback((content: string) => {
    if (!currentDocument) return;
    
    // If this is the welcome document and user is modifying it for the first time
    if (currentDocument.id === "welcome" && !hasUserModifiedWelcome) {
      setHasUserModifiedWelcome(true);
    }
    
    const updatedDoc = {
      ...currentDocument,
      content,
      updatedAt: new Date().toISOString(),
    };
    setCurrentDocument(updatedDoc);
  }, [currentDocument, hasUserModifiedWelcome]);

  const handleDocumentSelect = async (id: string) => {
    try {
      const doc = await getDocument(id);
      if (doc) {
        setCurrentDocument(doc);
        setHasUserModifiedWelcome(id === "welcome");
        // Store the last opened document
        localStorage.setItem('lastOpenedDocument', id);
        // Focus editor after selecting document
        setShouldFocusEditor(true);
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
    // Store the last opened document
    localStorage.setItem('lastOpenedDocument', newDoc.id);
    // Focus editor immediately after creating document
    setShouldFocusEditor(true);
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
      if (!currentDocument) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            const titleFromContent = extractTitleFromContent(currentDocument.content);
            const docToSave = {
              ...currentDocument,
              title: titleFromContent,
            };
            saveDocument(docToSave)
              .then(() => {
                toast.success("Document Saved", {
                  description: "Your document has been saved.",
                });
                setCurrentDocument(prev => prev ? { ...prev, title: titleFromContent } : null);
                refreshDocuments();
              })
              .catch(console.error);
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

  // Close sidebar by default on mobile for better UX
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  if (isLoading || !currentDocument) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-2">Press Cmd+K to open command palette</p>
        </div>
      </div>
    );
  }

  const editor = (
    <MobileEditor 
      value={currentDocument.content} 
      onChange={handleDocumentChange}
      shouldFocus={shouldFocusEditor}
      onFocus={() => setShouldFocusEditor(false)}
      onCommandPalette={() => setShowCommandPalette(true)}
    />
  );
  const preview = <OptimizedPreview markdown={currentDocument.content} />;

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
          {isMobile ? (
            <MobileLayout editor={editor} preview={preview} />
          ) : (
            <Resizable direction="horizontal" defaultSize={50} className="flex-1 overflow-hidden">
              {editor}
              {preview}
            </Resizable>
          )}
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
