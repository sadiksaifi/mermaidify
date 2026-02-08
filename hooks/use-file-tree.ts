"use client";

import { useFileTreeStore } from "@/contexts/file-tree-context";
import {
  findItemById,
  getItemUrlPath,
} from "@/lib/file-tree-utils";
import { useMemo } from "react";

export function useFileTree() {
  const store = useFileTreeStore((s) => s);

  const helpers = useMemo(
    () => ({
      findById: (id: string) => {
        return findItemById(store.items, id);
      },

      getUrlPath: (itemId: string) => {
        return getItemUrlPath(store.items, itemId);
      },

      isExpanded: (id: string) => {
        return store.expandedIds.has(id);
      },

      isSelected: (id: string) => {
        return store.selectedIds.has(id);
      },

      isRenaming: (id: string) => {
        return store.renamingId === id;
      },
    }),
    [store.items, store.expandedIds, store.selectedIds, store.renamingId]
  );

  return {
    ...store,
    ...helpers,
  };
}
