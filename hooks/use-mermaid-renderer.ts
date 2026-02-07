"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

const DEBOUNCE_MS = 300;

interface MermaidRendererResult {
  svg: string | null;
  error: string | null;
  isRendering: boolean;
}

export function useMermaidRenderer(code: string): MermaidRendererResult {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const mermaidRef = useRef<typeof import("mermaid").default | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const counterRef = useRef(0);
  const initializedThemeRef = useRef<string | undefined>(undefined);

  const initMermaid = useCallback(
    async (mermaid: typeof import("mermaid").default) => {
      const theme = resolvedTheme === "dark" ? "dark" : "default";
      mermaid.initialize({ startOnLoad: false, theme });
      initializedThemeRef.current = resolvedTheme;
    },
    [resolvedTheme],
  );

  // Lazy-load mermaid on mount
  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((mod) => {
      if (!cancelled) {
        const m = mod.default;
        initMermaid(m);
        mermaidRef.current = m;
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const render = useCallback(
    (source: string) => {
      clearTimeout(timeoutRef.current);

      if (!source.trim()) {
        setSvg(null);
        setError(null);
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        const mermaid = mermaidRef.current;
        if (!mermaid) return;

        // Re-initialize if theme changed
        if (initializedThemeRef.current !== resolvedTheme) {
          await initMermaid(mermaid);
        }

        setIsRendering(true);
        const id = `mermaid-render-${++counterRef.current}`;

        try {
          const { svg: rendered } = await mermaid.render(id, source);
          setSvg(rendered);
          setError(null);
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Invalid mermaid syntax";
          setError(message);
          // Keep last valid SVG
        } finally {
          // Clean up orphaned DOM element mermaid.render() may create
          const orphan = document.getElementById(id);
          orphan?.remove();
          setIsRendering(false);
        }
      }, DEBOUNCE_MS);
    },
    [resolvedTheme, initMermaid],
  );

  // Render when code or theme changes
  useEffect(() => {
    render(code);
  }, [code, render]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return { svg, error, isRendering };
}
