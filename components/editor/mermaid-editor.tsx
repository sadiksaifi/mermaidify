"use client";

import { useCallback } from "react";
import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import initMermaid from "monaco-mermaid";

interface MermaidEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
}

const handleBeforeMount: BeforeMount = (monaco) => {
  initMermaid(monaco);
};

export function MermaidEditor({ defaultValue, onChange }: MermaidEditorProps) {
  const { resolvedTheme } = useTheme();

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) onChange(value);
    },
    [onChange],
  );

  return (
    <Editor
      defaultValue={defaultValue}
      defaultLanguage="mermaid"
      theme={resolvedTheme === "dark" ? "mermaid-dark" : "mermaid"}
      beforeMount={handleBeforeMount}
      onChange={handleChange}
      loading={
        <div className="h-full w-full animate-pulse rounded bg-muted" />
      }
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}
