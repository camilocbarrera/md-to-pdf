"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, FileText, Plus, Search, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentType[];
  currentDocumentId: string;
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
  currentDocumentTitle: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  documents,
  currentDocumentId,
  onDocumentSelect,
  onCreateDocument,
  currentDocumentTitle,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  // Debounce search on mobile for better performance
  const debouncedSearch = useDebouncedValue(search, isMobile ? 300 : 0);

  // Define commands that are always available
  const commands = [
    {
      id: "export-pdf",
      title: "Export PDF",
      description: "Export current document as PDF",
      icon: FileDown,
      action: () => handleExportPdf(),
    },
    {
      id: "copy-title",
      title: "Copy Title",
      description: "Copy current document title",
      icon: FileText,
      action: () => handleCopyTitle(),
    },
    {
      id: "new-document",
      title: "New Document",
      description: "Create a new document",
      icon: Plus,
      action: () => {
        onCreateDocument();
        onOpenChange(false);
      },
    }
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower)
    );
  });

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower)
    );
  });

  // Add "Create new document" option if there's a search query
  const showCreateOption = debouncedSearch.trim().length > 0;
  const totalItems = filteredCommands.length + filteredDocuments.length + (showCreateOption ? 1 : 0);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedSearch]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation (disabled on mobile for better touch experience)
  useEffect(() => {
    if (isMobile) return; // Skip keyboard navigation on mobile

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case "Enter":
          e.preventDefault();
          handleSelect();
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, totalItems, isMobile]);

  const handleExportPdf = async () => {
    try {
      // Dynamically import the PDF export function
      const { exportToPdf } = await import("@/lib/pdf-export");
      await exportToPdf(currentDocumentTitle, theme);
      toast.success("PDF Exported", {
        description: `${currentDocumentTitle}.pdf has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export Failed", {
        description: "There was an error exporting the PDF. Please try again.",
      });
    }
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(currentDocumentTitle).then(() => {
      toast.success("Title Copied", {
        description: `"${currentDocumentTitle}" copied to clipboard.`,
      });
    }).catch(() => {
      toast.error("Copy Failed", {
        description: "Failed to copy title to clipboard.",
      });
    });
  };

  const handleSelect = (index?: number) => {
    const targetIndex = index !== undefined ? index : selectedIndex;
    let currentIndex = 0;
    
    // Check commands first
    if (targetIndex < filteredCommands.length) {
      filteredCommands[targetIndex].action();
      onOpenChange(false);
      return;
    }
    currentIndex += filteredCommands.length;
    
    // Check create option
    if (showCreateOption && targetIndex === currentIndex) {
      onCreateDocument();
      onOpenChange(false);
      return;
    }
    if (showCreateOption) currentIndex += 1;
    
    // Check documents
    const docIndex = targetIndex - currentIndex;
    const selectedDoc = filteredDocuments[docIndex];
    if (selectedDoc) {
      onDocumentSelect(selectedDoc.id);
      onOpenChange(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-accent text-accent-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getContentPreview = (content: string, query: string) => {
    if (!query.trim()) return content.slice(0, isMobile ? 50 : 80) + "...";

    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);

    if (index === -1) return content.slice(0, isMobile ? 50 : 80) + "...";

    const start = Math.max(0, index - (isMobile ? 25 : 40));
    const end = Math.min(content.length, index + query.length + (isMobile ? 25 : 40));
    const preview = content.slice(start, end);

    return (start > 0 ? "..." : "") + preview + (end < content.length ? "..." : "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-lg max-h-95 backdrop-blur-4 border-border shadow-card transition-ultra">
        <DialogTitle className="sr-only">Search and Create Documents</DialogTitle>
        <div className="flex items-center border-b px-2 h-8">
          <Search className="h-3 w-3 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or commands..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-6 text-sm px-2 transition-ultra"
            autoFocus={true} // Instant focus as specified
          />
        </div>

        <ScrollArea className="max-h-80 scroll-gpu">
          <div className="p-1">
            {totalItems === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                <FileText className="h-6 w-6 mx-auto mb-1 opacity-50" />
                No results found
              </div>
            ) : (
              <div className="space-y-0.5">
                {/* Commands Section */}
                {filteredCommands.map((cmd, index) => {
                  const isSelected = !isMobile && selectedIndex === index;
                  const Icon = cmd.icon;

                  return (
                    <div
                      key={cmd.id}
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1 text-xs cursor-pointer transition-ultra",
                        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(index)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight">
                          {highlightMatch(cmd.title, debouncedSearch)}
                        </div>
                        <div className="text-xs text-muted-foreground opacity-75 leading-tight">
                          {highlightMatch(cmd.description, debouncedSearch)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Create New Document Option */}
                {showCreateOption && (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1 text-xs cursor-pointer transition-ultra",
                      !isMobile && selectedIndex === filteredCommands.length ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    )}
                    onClick={() => handleSelect(filteredCommands.length)}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                      <Plus className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight">Create new document</div>
                      <div className="text-xs text-muted-foreground opacity-75 leading-tight">
                        Create "{debouncedSearch}"
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                {filteredDocuments.map((doc, index) => {
                  const itemIndex = filteredCommands.length + (showCreateOption ? 1 : 0) + index;
                  const isSelected = !isMobile && selectedIndex === itemIndex;
                  const isCurrent = doc.id === currentDocumentId;

                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-start gap-2 rounded px-2 py-1 text-xs cursor-pointer transition-ultra",
                        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(itemIndex)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted mt-0.5">
                        <FileText className={cn("h-3 w-3", isCurrent && "text-primary")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="font-medium truncate leading-tight">
                            {highlightMatch(doc.title, debouncedSearch)}
                          </div>
                          {isCurrent && (
                            <span className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded leading-none">
                              Current
                            </span>
                          )}
                        </div>
                        {!isMobile && (
                          <>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-tight">
                              {highlightMatch(getContentPreview(doc.content, debouncedSearch), debouncedSearch)}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground opacity-75">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(doc.updatedAt)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {!isMobile && (
          <div className="border-t px-2 py-1 text-xs text-muted-foreground">
            <div className="flex justify-between opacity-75">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
