"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { Editor } from "./editor";

interface MobileEditorProps {
  value: string;
  onChange: (value: string) => void;
  shouldFocus?: boolean;
  onFocus?: () => void;
  onCommandPalette?: () => void;
}

export function MobileEditor({ value, onChange, shouldFocus = false, onFocus, onCommandPalette }: MobileEditorProps) {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when requested
  useEffect(() => {
    if (shouldFocus && textareaRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        textareaRef.current?.focus();
        // Move cursor to end of content
        const length = value.length;
        textareaRef.current?.setSelectionRange(length, length);
        onFocus?.();
      }, 100);
    }
  }, [shouldFocus, onFocus, value.length]);

  // Handle keyboard shortcuts in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      onCommandPalette?.();
    }
  };

  if (isMobile) {
    return (
      <div className="h-full w-full p-2 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-0 bg-background text-foreground focus:outline-none focus:ring-0 font-mono text-sm leading-tight overflow-auto transition-ultra"
          placeholder="Type your Markdown here..."
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          style={{
            fontFamily: "'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            fontSize: '13px',
            lineHeight: '1.3',
          }}
        />
      </div>
    );
  }

  return <Editor value={value} onChange={onChange} shouldFocus={shouldFocus} onFocus={onFocus} onCommandPalette={onCommandPalette} />;
} 