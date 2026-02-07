"use client";

import { useCallback, useRef } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useTheme } from "next-themes";
import initMermaid from "monaco-mermaid";
import { useMermaidLinter } from "@/hooks/use-mermaid-linter";

interface MermaidEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
}

const handleBeforeMount: BeforeMount = (monaco) => {
  initMermaid(monaco);
};

export function MermaidEditor({ defaultValue, onChange }: MermaidEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const { validate } = useMermaidLinter(editorRef, monacoRef);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      validate(defaultValue);
    },
    [defaultValue, validate],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
        validate(value);
      }
    },
    [onChange, validate],
  );

  return (
    <Editor
      defaultValue={defaultValue}
      defaultLanguage="mermaid"
      theme={resolvedTheme === "dark" ? "mermaid-dark" : "mermaid"}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
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
