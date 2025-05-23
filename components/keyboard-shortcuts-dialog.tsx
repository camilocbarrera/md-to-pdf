"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { keys: ["Ctrl/⌘", "K"], description: "Open command palette / Search documents" },
    { keys: ["Ctrl/⌘", "S"], description: "Save document" },
    { keys: ["Ctrl/⌘", "B"], description: "Toggle sidebar" },
    { keys: ["↑", "↓"], description: "Navigate search results" },
    { keys: ["Enter"], description: "Select document or create new" },
    { keys: ["Esc"], description: "Close dialogs" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="rounded bg-muted px-2 py-1 font-mono text-xs">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
