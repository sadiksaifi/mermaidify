"use client";

import * as React from "react";
import type { FileTreeItem } from "@/lib/types";
import { buildTreeFromFlatList, getParentIds } from "@/lib/file-tree-utils";
import {
  getUserFileTree,
  createItem as createItemAction,
  renameItem as renameItemAction,
  moveItem as moveItemAction,
  deleteItem as deleteItemAction,
} from "@/app/(app)/actions";

interface FileTreeState {
  items: FileTreeItem[];
  expandedIds: Set<string>;
  selectedId: string | null;
  renamingId: string | null;
  isLoading: boolean;
}

interface FileTreeContextValue extends FileTreeState {
  // Expansion
  toggleExpanded: (id: string) => void;
  expandTo: (id: string) => void;

  // Selection
  setSelectedId: (id: string | null) => void;

  // Rename
  startRenaming: (id: string) => void;
  finishRenaming: (id: string, newName: string) => void;
  cancelRenaming: () => void;

  // CRUD operations
  createFile: (parentId: string | null, name?: string) => string;
  createFolder: (parentId: string | null, name?: string) => string;
  deleteItem: (id: string) => void;

  // Move (for drag and drop)
  moveItem: (itemId: string, newParentId: string | null) => void;
}

const FileTreeContext = React.createContext<FileTreeContextValue | null>(null);

export function useFileTreeContext() {
  const context = React.useContext(FileTreeContext);
  if (!context) {
    throw new Error("useFileTreeContext must be used within a FileTreeProvider");
  }
  return context;
}

function removeItemFromTree(
  items: FileTreeItem[],
  id: string
): { items: FileTreeItem[]; removed: FileTreeItem | null } {
  let removed: FileTreeItem | null = null;

  const filter = (nodes: FileTreeItem[]): FileTreeItem[] => {
    return nodes.reduce<FileTreeItem[]>((acc, node) => {
      if (node.id === id) {
        removed = node;
        return acc;
      }
      if (node.children) {
        return [...acc, { ...node, children: filter(node.children) }];
      }
      return [...acc, node];
    }, []);
  };

  return { items: filter(items), removed };
}

function addItemToTree(
  items: FileTreeItem[],
  parentId: string | null,
  newItem: FileTreeItem
): FileTreeItem[] {
  if (parentId === null) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addItemToTree(item.children, parentId, newItem),
      };
    }
    return item;
  });
}

function updateItemInTree(
  items: FileTreeItem[],
  id: string,
  updates: Partial<FileTreeItem>
): FileTreeItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemInTree(item.children, id, updates),
      };
    }
    return item;
  });
}

export function FileTreeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FileTreeState>({
    items: [],
    expandedIds: new Set<string>(),
    selectedId: null,
    renamingId: null,
    isLoading: true,
  });

  // Load file tree from DB on mount
  React.useEffect(() => {
    getUserFileTree().then((rows) => {
      const tree = buildTreeFromFlatList(rows);
      setState((prev) => ({ ...prev, items: tree, isLoading: false }));
    });
  }, []);

  const toggleExpanded = React.useCallback((id: string) => {
    setState((prev) => {
      const newExpandedIds = new Set(prev.expandedIds);
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id);
      } else {
        newExpandedIds.add(id);
      }
      return { ...prev, expandedIds: newExpandedIds };
    });
  }, []);

  const expandTo = React.useCallback((id: string) => {
    setState((prev) => {
      const parentIds = getParentIds(prev.items, id);
      const newExpandedIds = new Set(prev.expandedIds);
      parentIds.forEach((parentId) => newExpandedIds.add(parentId));
      return { ...prev, expandedIds: newExpandedIds };
    });
  }, []);

  const setSelectedId = React.useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const startRenaming = React.useCallback((id: string) => {
    setState((prev) => ({ ...prev, renamingId: id }));
  }, []);

  const finishRenaming = React.useCallback((id: string, newName: string) => {
    // Optimistic update
    setState((prev) => ({
      ...prev,
      items: updateItemInTree(prev.items, id, { name: newName }),
      renamingId: null,
    }));
    // Persist to DB
    renameItemAction(id, newName);
  }, []);

  const cancelRenaming = React.useCallback(() => {
    setState((prev) => ({ ...prev, renamingId: null }));
  }, []);

  const createFile = React.useCallback(
    (parentId: string | null, name = "Untitled.mmd") => {
      // Generate a temporary ID for optimistic update
      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "file",
        parentId,
      };

      setState((prev) => ({
        ...prev,
        items: addItemToTree(prev.items, parentId, newItem),
        renamingId: tempId,
      }));

      // Persist to DB and replace temp ID with real ID
      createItemAction(parentId, name, false).then((dbItem) => {
        setState((prev) => ({
          ...prev,
          items: updateItemInTree(prev.items, tempId, { id: dbItem.id }),
          renamingId: prev.renamingId === tempId ? dbItem.id : prev.renamingId,
          selectedId: prev.selectedId === tempId ? dbItem.id : prev.selectedId,
        }));
      });

      return tempId;
    },
    []
  );

  const createFolder = React.useCallback(
    (parentId: string | null, name = "New Folder") => {
      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "folder",
        parentId,
        children: [],
      };

      setState((prev) => ({
        ...prev,
        items: addItemToTree(prev.items, parentId, newItem),
        expandedIds: parentId
          ? new Set([...prev.expandedIds, parentId])
          : prev.expandedIds,
        renamingId: tempId,
      }));

      // Persist to DB and replace temp ID with real ID
      createItemAction(parentId, name, true).then((dbItem) => {
        setState((prev) => ({
          ...prev,
          items: updateItemInTree(prev.items, tempId, { id: dbItem.id }),
          renamingId: prev.renamingId === tempId ? dbItem.id : prev.renamingId,
          selectedId: prev.selectedId === tempId ? dbItem.id : prev.selectedId,
          expandedIds: prev.expandedIds.has(tempId)
            ? new Set(
                [...prev.expandedIds].map((id) =>
                  id === tempId ? dbItem.id : id
                )
              )
            : prev.expandedIds,
        }));
      });

      return tempId;
    },
    []
  );

  const deleteItem = React.useCallback((id: string) => {
    // Optimistic update
    setState((prev) => {
      const { items } = removeItemFromTree(prev.items, id);
      const newExpandedIds = new Set(prev.expandedIds);
      newExpandedIds.delete(id);
      return {
        ...prev,
        items,
        expandedIds: newExpandedIds,
        selectedId: prev.selectedId === id ? null : prev.selectedId,
        renamingId: prev.renamingId === id ? null : prev.renamingId,
      };
    });
    // Persist to DB
    deleteItemAction(id);
  }, []);

  const moveItem = React.useCallback(
    (itemId: string, newParentId: string | null) => {
      // Don't move to itself
      if (itemId === newParentId) return;

      // Optimistic update
      setState((prev) => {
        const { items: itemsAfterRemoval, removed } = removeItemFromTree(
          prev.items,
          itemId
        );
        if (!removed) return prev;

        const updatedItem = { ...removed, parentId: newParentId };
        const newItems = addItemToTree(itemsAfterRemoval, newParentId, updatedItem);

        const newExpandedIds = newParentId
          ? new Set([...prev.expandedIds, newParentId])
          : prev.expandedIds;

        return { ...prev, items: newItems, expandedIds: newExpandedIds };
      });

      // Persist to DB
      moveItemAction(itemId, newParentId);
    },
    []
  );

  const value = React.useMemo<FileTreeContextValue>(
    () => ({
      ...state,
      toggleExpanded,
      expandTo,
      setSelectedId,
      startRenaming,
      finishRenaming,
      cancelRenaming,
      createFile,
      createFolder,
      deleteItem,
      moveItem,
    }),
    [
      state,
      toggleExpanded,
      expandTo,
      setSelectedId,
      startRenaming,
      finishRenaming,
      cancelRenaming,
      createFile,
      createFolder,
      deleteItem,
      moveItem,
    ]
  );

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  );
}
