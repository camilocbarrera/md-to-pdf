"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteDocument, saveDocument } from "@/lib/storage";
import type { DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Edit, FilePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  documents: DocumentType[];
  currentDocumentId: string;
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({
  documents,
  currentDocumentId,
  onDocumentSelect,
  onCreateDocument,
  open,
  setOpen,
}: SidebarProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState<DocumentType | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRenameClick = (doc: DocumentType) => {
    setDocumentToRename(doc);
    setNewTitle(doc.title);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (documentToRename && newTitle.trim()) {
      const updatedDoc = {
        ...documentToRename,
        title: newTitle.trim(),
        updatedAt: new Date().toISOString(),
      };
      await saveDocument(updatedDoc);
      setRenameDialogOpen(false);
      toast.success("Document Renamed", {
        description: `"${documentToRename.title}" has been renamed to "${newTitle.trim()}".`,
      });
      // Force a refresh of the document list
      window.location.reload();
    }
  };

  const handleDeleteDocument = async (doc: DocumentType) => {
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      await deleteDocument(doc.id);
      toast.success("Document Deleted", {
        description: `"${doc.title}" has been deleted.`,
      });
      // Force a refresh of the document list
      window.location.reload();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className={cn(
          "h-full border-r transition-all duration-300 bg-background",
          open ? "w-64" : "w-0"
        )}
      >
        {open && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Documents</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2">
              <Button variant="outline" className="w-full justify-start" onClick={onCreateDocument}>
                <FilePlus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="space-y-1 p-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                      currentDocumentId === doc.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <button
                      className="flex-1 text-left truncate"
                      onClick={() => onDocumentSelect(doc.id)}
                    >
                      <div className="font-medium truncate">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(doc.updatedAt)}
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameClick(doc)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteDocument(doc)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {!open && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-10"
          onClick={() => setOpen(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title"
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
