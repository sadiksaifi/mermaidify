"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFileTree } from "@/hooks/use-file-tree";
import {
  useFileContentQuery,
  useSaveFileContentMutation,
} from "@/features/items/query";
import { MermaidEditor } from "@/components/editor/mermaid-editor";

interface FilePageClientProps {
  itemId: string;
}

export function FilePageClient({ itemId }: FilePageClientProps) {
  const { setSelectedId, expandTo } = useFileTree();
  const { data, isLoading } = useFileContentQuery(itemId);
  const { mutate: saveContent } = useSaveFileContentMutation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setSelectedId(itemId);
    expandTo(itemId);
  }, [itemId, setSelectedId, expandTo]);

  const handleChange = useCallback(
    (value: string) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveContent({ itemId, content: value });
      }, 1000);
    },
    [itemId, saveContent],
  );

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (isLoading) {
    return <div className="h-full animate-pulse rounded bg-muted" />;
  }

  return (
    <MermaidEditor
      key={itemId}
      defaultValue={data?.content ?? ""}
      onChange={handleChange}
    />
  );
}
