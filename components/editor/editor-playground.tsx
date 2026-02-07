"use client";

import { useState, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MermaidEditor } from "@/components/editor/mermaid-editor";
import { MermaidPreview } from "@/components/editor/mermaid-preview";
import { useMermaidRenderer } from "@/hooks/use-mermaid-renderer";

interface EditorPlaygroundProps {
  defaultValue: string;
  onChange: (value: string) => void;
  splitDirection: "horizontal" | "vertical";
}

export function EditorPlayground({
  defaultValue,
  onChange,
  splitDirection,
}: EditorPlaygroundProps) {
  const [currentCode, setCurrentCode] = useState(defaultValue);
  const { svg, error } = useMermaidRenderer(currentCode);

  const handleChange = useCallback(
    (value: string) => {
      setCurrentCode(value);
      onChange(value);
    },
    [onChange],
  );

  return (
    <ResizablePanelGroup
      orientation={splitDirection}
      className="h-full"
    >
      <ResizablePanel defaultSize={50} minSize={20}>
        <MermaidEditor defaultValue={defaultValue} onChange={handleChange} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <MermaidPreview svg={svg} error={error} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
