"use client";

import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.updateOptions({ tabSize: 2 });
      }
    }
  }, [editorRef.current]);

  return (
    <div className="h-full w-full overflow-hidden">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          wrappingIndent: "same",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
