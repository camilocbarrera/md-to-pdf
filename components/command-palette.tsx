"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, FileText, Hash, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentType[];
  currentDocumentId: string;
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  documents,
  currentDocumentId,
  onDocumentSelect,
  onCreateDocument,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = search.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower)
    );
  });

  // Add "Create new document" option if there's a search query
  const showCreateOption = search.trim().length > 0;
  const totalItems = filteredDocuments.length + (showCreateOption ? 1 : 0);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
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
  }, [open, selectedIndex, totalItems]);

  const handleSelect = () => {
    if (showCreateOption && selectedIndex === 0) {
      // Create new document with search query as title
      onCreateDocument();
      onOpenChange(false);
    } else {
      const docIndex = showCreateOption ? selectedIndex - 1 : selectedIndex;
      const selectedDoc = filteredDocuments[docIndex];
      if (selectedDoc) {
        onDocumentSelect(selectedDoc.id);
        onOpenChange(false);
      }
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
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getContentPreview = (content: string, query: string) => {
    if (!query.trim()) return content.slice(0, 100) + "...";

    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);

    if (index === -1) return content.slice(0, 100) + "...";

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    const preview = content.slice(start, end);

    return (start > 0 ? "..." : "") + preview + (end < content.length ? "..." : "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            {totalItems === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No documents found
              </div>
            ) : (
              <div className="space-y-1">
                {showCreateOption && (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                      selectedIndex === 0 ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    )}
                    onClick={handleSelect}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Create "{search}"</div>
                      <div className="text-xs text-muted-foreground">Create a new document</div>
                    </div>
                  </div>
                )}

                {filteredDocuments.map((doc, index) => {
                  const itemIndex = showCreateOption ? index + 1 : index;
                  const isSelected = selectedIndex === itemIndex;
                  const isCurrent = doc.id === currentDocumentId;

                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-start gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        onDocumentSelect(doc.id);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted mt-0.5">
                        <FileText className={cn("h-4 w-4", isCurrent && "text-primary")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">
                            {highlightMatch(doc.title, search)}
                          </div>
                          {isCurrent && (
                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {highlightMatch(getContentPreview(doc.content, search), search)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.updatedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
