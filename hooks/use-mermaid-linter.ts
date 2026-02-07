import { useRef, useCallback, useEffect } from "react";
import type * as Monaco from "monaco-editor";

const DEBOUNCE_MS = 500;
const OWNER = "mermaid-linter";

export function useMermaidLinter(
  editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor | null>,
  monacoRef: React.RefObject<typeof Monaco | null>,
) {
  const mermaidRef = useRef<typeof import("mermaid").default | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Lazy-load mermaid on mount
  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mod) => {
      if (!cancelled) {
        const m = mod.default;
        m.initialize({ startOnLoad: false });
        mermaidRef.current = m;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = useCallback(
    (code: string) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        const mermaid = mermaidRef.current;
        const editor = editorRef.current;
        const monaco = monacoRef.current;
        if (!mermaid || !editor || !monaco) return;

        const model = editor.getModel();
        if (!model) return;

        try {
          await mermaid.parse(code);
          monaco.editor.setModelMarkers(model, OWNER, []);
        } catch (error: unknown) {
          const markers: Monaco.editor.IMarkerData[] = [];
          const err = error as {
            hash?: {
              loc?: {
                first_line: number;
                last_line: number;
                first_column: number;
                last_column: number;
              };
            };
            message?: string;
          };

          if (err?.hash?.loc) {
            const loc = err.hash.loc;
            markers.push({
              startLineNumber: loc.first_line,
              startColumn: loc.first_column + 1,
              endLineNumber: loc.last_line,
              endColumn: loc.last_column + 1,
              message: err.message ?? "Syntax error",
              severity: monaco.MarkerSeverity.Error,
              source: OWNER,
            });
          } else {
            // Fallback: mark first line when no location info
            markers.push({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: model.getLineMaxColumn(1),
              message: (error as Error)?.message ?? "Invalid mermaid syntax",
              severity: monaco.MarkerSeverity.Error,
              source: OWNER,
            });
          }
          monaco.editor.setModelMarkers(model, OWNER, markers);
        }
      }, DEBOUNCE_MS);
    },
    [editorRef, monacoRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    return () => {
      clearTimeout(timeoutRef.current);
      if (editor && monaco) {
        const model = editor.getModel();
        if (model) monaco.editor.setModelMarkers(model, OWNER, []);
      }
    };
  }, [editorRef, monacoRef]);

  return { validate };
}
