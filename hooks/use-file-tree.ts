"use client";

import { useFileTreeContext } from "@/contexts/file-tree-context";
import {
  findItemById,
  findItemByPath,
  getItemUrlPath,
  getPathToItem,
} from "@/lib/file-tree-utils";
import type { FileTreeItem } from "@/lib/mock-file-tree";
import { useMemo } from "react";

export function useFileTree() {
  const context = useFileTreeContext();

  const helpers = useMemo(
    () => ({
      /**
       * Find an item by its ID
       */
      findById: (id: string): FileTreeItem | null => {
        return findItemById(context.items, id);
      },

      /**
       * Find an item by URL slug path
       */
      findByPath: (slugPath: string[]): FileTreeItem | null => {
        return findItemByPath(context.items, slugPath);
      },

      /**
       * Get the URL path for an item
       */
      getUrlPath: (itemId: string): string | null => {
        return getItemUrlPath(context.items, itemId);
      },

      /**
       * Get the breadcrumb path for an item
       */
      getBreadcrumbPath: (itemId: string): FileTreeItem[] => {
        return getPathToItem(context.items, itemId);
      },

      /**
       * Check if an item is expanded
       */
      isExpanded: (id: string): boolean => {
        return context.expandedIds.has(id);
      },

      /**
       * Check if an item is selected
       */
      isSelected: (id: string): boolean => {
        return context.selectedId === id;
      },

      /**
       * Check if an item is being renamed
       */
      isRenaming: (id: string): boolean => {
        return context.renamingId === id;
      },

      /**
       * Get the selected item
       */
      getSelectedItem: (): FileTreeItem | null => {
        if (!context.selectedId) return null;
        return findItemById(context.items, context.selectedId);
      },
    }),
    [context.items, context.expandedIds, context.selectedId, context.renamingId]
  );

  return {
    ...context,
    ...helpers,
  };
}
