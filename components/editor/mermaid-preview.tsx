"use client";

// Safari's GestureEvent is not in standard TypeScript DOM lib
interface GestureEvent extends UIEvent {
  scale: number;
  rotation: number;
}

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { IconZoomIn, IconZoomOut, IconZoomScan, IconMaximize, IconMinimize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MermaidPreviewProps {
  svg: string | null;
  error: string | null;
}

export function MermaidPreview({ svg, error }: MermaidPreviewProps) {
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      transformStart.current = { x: transform.x, y: transform.y };
    },
    [transform.x, transform.y],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + (e.clientX - dragStart.current.x),
        y: transformStart.current.y + (e.clientY - dragStart.current.y),
      }));
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom toward a point (cursor or container center), adjusting pan to keep
  // that point visually stationary. Using a single state object + functional
  // updater guarantees correct previous values even during rapid trackpad events.
  const zoomToward = useCallback(
    (cx: number, cy: number, factor: number) => {
      setTransform((prev) => {
        const newScale = Math.min(10, Math.max(0.1, prev.scale * factor));
        const ratio = newScale / prev.scale;
        return {
          x: cx - (cx - prev.x) * ratio,
          y: cy - (cy - prev.y) * ratio,
          scale: newScale,
        };
      });
    },
    [],
  );

  // Track the last gesture scale so we can compute deltas between events
  const lastGestureScale = useRef(1);

  // Callback ref: attaches non-passive wheel + Safari gesture listeners when
  // the DOM node mounts, and cleans up when it unmounts. This fixes the bug
  // where useEffect ran before the container existed (early return for empty state).
  const cleanupRef = useRef<(() => void) | null>(null);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Clean up previous listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      containerNodeRef.current = node;
      if (!node) return;

      // Wheel handler: only intercept pinch-to-zoom (ctrlKey), let regular
      // scroll pass through. Browsers report trackpad pinch as wheel events
      // with ctrlKey: true.
      const handleWheel = (e: WheelEvent) => {
        if (!e.ctrlKey) return; // regular scroll — don't hijack
        e.preventDefault();
        const rect = node.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        // Pinch events have small deltaY; use higher sensitivity (d3-zoom pattern)
        const factor = Math.pow(2, -e.deltaY * 0.01);
        zoomToward(cursorX, cursorY, factor);
      };

      // Safari gesture events for trackpad pinch (not covered by wheel events)
      const handleGestureStart = (e: Event) => {
        e.preventDefault();
        lastGestureScale.current = (e as GestureEvent).scale;
      };

      const handleGestureChange = (e: Event) => {
        e.preventDefault();
        const ge = e as GestureEvent;
        const rect = node.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const factor = ge.scale / lastGestureScale.current;
        lastGestureScale.current = ge.scale;
        zoomToward(cx, cy, factor);
      };

      const handleGestureEnd = (e: Event) => {
        e.preventDefault();
      };

      node.addEventListener("wheel", handleWheel, { passive: false });
      node.addEventListener("gesturestart", handleGestureStart, {
        passive: false,
      });
      node.addEventListener("gesturechange", handleGestureChange, {
        passive: false,
      });
      node.addEventListener("gestureend", handleGestureEnd, {
        passive: false,
      });

      cleanupRef.current = () => {
        node.removeEventListener("wheel", handleWheel);
        node.removeEventListener("gesturestart", handleGestureStart);
        node.removeEventListener("gesturechange", handleGestureChange);
        node.removeEventListener("gestureend", handleGestureEnd);
      };
    },
    [zoomToward],
  );

  const handleZoomIn = useCallback(() => {
    const container = containerNodeRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    zoomToward(rect.width / 2, rect.height / 2, 1.2);
  }, [zoomToward]);

  const handleZoomOut = useCallback(() => {
    const container = containerNodeRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    zoomToward(rect.width / 2, rect.height / 2, 1 / 1.2);
  }, [zoomToward]);

  const handleFitToView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // Exit fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Pre-process SVG: extract intrinsic dimensions and make it responsive
  // so we can size it via CSS width/height instead of CSS scale() — keeps
  // the SVG rendering as a vector at any zoom level (no rasterization blur).
  const processed = useMemo(() => {
    if (!svg) return null;
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const el = doc.querySelector("svg");
    if (!el) return null;

    // Extract intrinsic dimensions — prefer viewBox (canonical coordinate
    // space). Mermaid sets width="100%" which parseFloat reads as 100, so
    // width/height attributes are only used as fallback for absolute values.
    const vb = el.getAttribute("viewBox");
    const vbParts = vb?.split(/[\s,]+/).map(Number);
    const wAttr = el.getAttribute("width") || "";
    const hAttr = el.getAttribute("height") || "";
    const isAbsoluteW = /^\d/.test(wAttr) && !wAttr.includes("%");
    const isAbsoluteH = /^\d/.test(hAttr) && !hAttr.includes("%");

    let intrinsicW: number;
    let intrinsicH: number;

    if (vbParts && vbParts.length === 4 && vbParts[2] > 0 && vbParts[3] > 0) {
      intrinsicW = vbParts[2];
      intrinsicH = vbParts[3];
    } else {
      intrinsicW = isAbsoluteW ? parseFloat(wAttr) : 100;
      intrinsicH = isAbsoluteH ? parseFloat(hAttr) : 100;
    }

    if (!vb) el.setAttribute("viewBox", `0 0 ${intrinsicW} ${intrinsicH}`);
    el.setAttribute("width", "100%");
    el.setAttribute("height", "100%");
    el.removeAttribute("style"); // strip mermaid's max-width

    return { html: el.outerHTML, width: intrinsicW, height: intrinsicH };
  }, [svg]);

  // Empty state
  if (!svg && !error) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Start typing to see preview</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden select-none",
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "relative h-full w-full",
      )}
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG content — sized via width/height instead of CSS scale() to keep
           the SVG rendering as a crisp vector at every zoom level */}
      {processed && (
        <div
          className={error ? "opacity-30" : undefined}
          style={{
            position: "absolute",
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            transformOrigin: "0 0",
            width: `${processed.width * transform.scale}px`,
            height: `${processed.height * transform.scale}px`,
          }}
          dangerouslySetInnerHTML={{ __html: processed.html }}
        />
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-x-0 top-0 z-10 m-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-xs font-medium text-destructive">Syntax Error</p>
          <p className="mt-1 text-xs text-destructive/80 line-clamp-3">
            {error}
          </p>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg border bg-background/80 p-1 backdrop-blur-sm">
        <Button variant="ghost" size="icon-xs" onClick={handleZoomOut}>
          <IconZoomOut className="size-3.5" />
        </Button>
        <span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(transform.scale * 100)}%
        </span>
        <Button variant="ghost" size="icon-xs" onClick={handleZoomIn}>
          <IconZoomIn className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={handleFitToView}>
          <IconZoomScan className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setIsFullscreen((f) => !f)}
        >
          {isFullscreen ? <IconMinimize className="size-3.5" /> : <IconMaximize className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
