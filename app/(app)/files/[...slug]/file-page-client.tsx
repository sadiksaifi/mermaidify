"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFileTree } from "@/hooks/use-file-tree";
import {
  useFileContentQuery,
  useSaveFileContentMutation,
} from "@/features/items/query";
import { useSettingsQuery } from "@/features/settings/query";
import { DEFAULT_SETTINGS } from "@/features/settings/constants";
import { EditorPlayground } from "@/components/editor/editor-playground";

interface FilePageClientProps {
  itemId: string;
  splitDirection: "horizontal" | "vertical";
}

export function FilePageClient({ itemId, splitDirection }: FilePageClientProps) {
  const { setSelectedId, expandTo } = useFileTree();
  const { data, isLoading } = useFileContentQuery(itemId);
  const { mutate: saveContent } = useSaveFileContentMutation();
  const { data: settings } = useSettingsQuery();
  const s = settings ?? DEFAULT_SETTINGS;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setSelectedId(itemId);
    expandTo(itemId);
  }, [itemId, setSelectedId, expandTo]);

  const handleChange = useCallback(
    (value: string) => {
      if (!s.autoSaveEnabled) return;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveContent({ itemId, content: value });
      }, s.autoSaveDelay);
    },
    [itemId, saveContent, s.autoSaveEnabled, s.autoSaveDelay],
  );

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (isLoading) {
    return <div className="h-full animate-pulse rounded bg-muted" />;
  }

  return (
    <EditorPlayground
      key={itemId}
      defaultValue={data?.content ?? ""}
      onChange={handleChange}
      splitDirection={splitDirection}
    />
  );
}
