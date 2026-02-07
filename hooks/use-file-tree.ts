"use client";

import { useFileTreeContext } from "@/contexts/file-tree-context";
import {
  findItemById,
  getItemUrlPath,
} from "@/lib/file-tree-utils";
import type { FileTreeItem } from "@/lib/types";
import { useMemo } from "react";

export function useFileTree() {
  const context = useFileTreeContext();

  const helpers = useMemo(
    () => ({
      findById: (id: string): FileTreeItem | null => {
        return findItemById(context.items, id);
      },

      getUrlPath: (itemId: string): string | null => {
        return getItemUrlPath(context.items, itemId);
      },

      isExpanded: (id: string): boolean => {
        return context.expandedIds.has(id);
      },

      isSelected: (id: string): boolean => {
        return context.selectedId === id;
      },

      isRenaming: (id: string): boolean => {
        return context.renamingId === id;
      },
    }),
    [context.items, context.expandedIds, context.selectedId, context.renamingId]
  );

  return {
    ...context,
    ...helpers,
  };
}
