"use client";

import MonacoEditor from "@monaco-editor/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  shouldFocus?: boolean;
  onFocus?: () => void;
  onCommandPalette?: () => void;
}

export function Editor({ value, onChange, shouldFocus = false, onFocus, onCommandPalette }: EditorProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add command for Cmd+K to open command palette
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
      () => {
        onCommandPalette?.();
      }
    );
    
    // Auto-focus on mount if requested
    if (shouldFocus) {
      setTimeout(() => {
        editor.focus();
        // Move cursor to end of content
        const model = editor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lastLineLength = model.getLineLength(lineCount);
          editor.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
        }
        onFocus?.();
      }, 100);
    }
  };

  // Handle focus requests after mount
  useEffect(() => {
    if (shouldFocus && editorRef.current) {
      setTimeout(() => {
        editorRef.current.focus();
        // Move cursor to end of content
        const model = editorRef.current.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          const lastLineLength = model.getLineLength(lineCount);
          editorRef.current.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
        }
        onFocus?.();
      }, 100);
    }
  }, [shouldFocus, onFocus]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.updateOptions({ tabSize: 2 });
      }
    }
  }, [editorRef.current]);

  return (
    <div className="h-full w-full overflow-hidden scroll-gpu">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: !isMobile },
          wordWrap: "on",
          wrappingIndent: "same",
          lineNumbers: isMobile ? "off" : "on",
          scrollBeyondLastLine: false,
          fontSize: 13,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
          lineHeight: 1.3,
          automaticLayout: true,
          folding: !isMobile,
          lineDecorationsWidth: isMobile ? 0 : 8,
          lineNumbersMinChars: isMobile ? 0 : 2,
          glyphMargin: !isMobile,
          rulers: isMobile ? [] : [80],
          renderLineHighlight: isMobile ? "none" : "line",
          scrollbar: {
            vertical: isMobile ? "hidden" : "auto",
            horizontal: isMobile ? "hidden" : "auto",
            verticalScrollbarSize: isMobile ? 0 : 12,
            horizontalScrollbarSize: isMobile ? 0 : 8,
          },
          suggest: {
            showKeywords: !isMobile,
            showSnippets: !isMobile,
          },
          quickSuggestions: !isMobile,
          parameterHints: {
            enabled: !isMobile,
          },
          hover: {
            enabled: !isMobile,
          },
          wordBasedSuggestions: false,
          links: !isMobile,
          colorDecorators: !isMobile,
          renderWhitespace: "none",
          renderControlCharacters: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: true,
        }}
      />
    </div>
  );
}
