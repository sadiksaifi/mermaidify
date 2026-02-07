"use client";

import * as React from "react";
import type { FileTreeItem } from "@/lib/types";
import { buildTreeFromFlatList, getParentIds } from "@/lib/file-tree-utils";
import {
  useItemsQuery,
  useCreateItemMutation,
  useRenameItemMutation,
  useMoveItemMutation,
  useDeleteItemMutation,
} from "@/features/items/query";

interface FileTreeState {
  expandedIds: Set<string>;
  selectedId: string | null;
  renamingId: string | null;
}

interface FileTreeContextValue extends FileTreeState {
  items: FileTreeItem[];
  isLoading: boolean;

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

export function FileTreeProvider({ children }: { children: React.ReactNode }) {
  const { data: rows, isLoading } = useItemsQuery();
  const createItemMutation = useCreateItemMutation();
  const renameItemMutation = useRenameItemMutation();
  const moveItemMutation = useMoveItemMutation();
  const deleteItemMutation = useDeleteItemMutation();

  const [uiState, setUiState] = React.useState<FileTreeState>({
    expandedIds: new Set<string>(),
    selectedId: null,
    renamingId: null,
  });

  // Pending optimistic items before the server returns real IDs
  const [pendingItems, setPendingItems] = React.useState<FileTreeItem[]>([]);

  // Build tree from server data + pending optimistic items
  const items = React.useMemo(() => {
    const serverTree = rows ? buildTreeFromFlatList(rows) : [];
    // Layer pending items on top
    let tree = serverTree;
    for (const pending of pendingItems) {
      tree = addItemToTree(tree, pending.parentId, pending);
    }
    return tree;
  }, [rows, pendingItems]);

  const toggleExpanded = React.useCallback((id: string) => {
    setUiState((prev) => {
      const newExpandedIds = new Set(prev.expandedIds);
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id);
      } else {
        newExpandedIds.add(id);
      }
      return { ...prev, expandedIds: newExpandedIds };
    });
  }, []);

  const expandTo = React.useCallback(
    (id: string) => {
      const parentIds = getParentIds(items, id);
      setUiState((prev) => {
        const newExpandedIds = new Set(prev.expandedIds);
        parentIds.forEach((parentId) => newExpandedIds.add(parentId));
        return { ...prev, expandedIds: newExpandedIds };
      });
    },
    [items]
  );

  const setSelectedId = React.useCallback((id: string | null) => {
    setUiState((prev) => ({ ...prev, selectedId: id }));
  }, []);

  const startRenaming = React.useCallback((id: string) => {
    setUiState((prev) => ({ ...prev, renamingId: id }));
  }, []);

  const finishRenaming = React.useCallback(
    (id: string, newName: string) => {
      setUiState((prev) => ({ ...prev, renamingId: null }));
      renameItemMutation.mutate({ itemId: id, newName });
    },
    [renameItemMutation]
  );

  const cancelRenaming = React.useCallback(() => {
    setUiState((prev) => ({ ...prev, renamingId: null }));
  }, []);

  const createFile = React.useCallback(
    (parentId: string | null, name = "Untitled.mmd") => {
      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "file",
        parentId,
      };

      setPendingItems((prev) => [...prev, newItem]);
      setUiState((prev) => ({ ...prev, renamingId: tempId }));

      createItemMutation.mutate(
        { parentId, name, isFolder: false },
        {
          onSuccess: (dbItem) => {
            setPendingItems((prev) => prev.filter((p) => p.id !== tempId));
            setUiState((prev) => ({
              ...prev,
              renamingId: prev.renamingId === tempId ? dbItem.id : prev.renamingId,
              selectedId: prev.selectedId === tempId ? dbItem.id : prev.selectedId,
            }));
          },
          onError: () => {
            setPendingItems((prev) => prev.filter((p) => p.id !== tempId));
          },
        }
      );

      return tempId;
    },
    [createItemMutation]
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

      setPendingItems((prev) => [...prev, newItem]);
      setUiState((prev) => ({
        ...prev,
        expandedIds: parentId
          ? new Set([...prev.expandedIds, parentId])
          : prev.expandedIds,
        renamingId: tempId,
      }));

      createItemMutation.mutate(
        { parentId, name, isFolder: true },
        {
          onSuccess: (dbItem) => {
            setPendingItems((prev) => prev.filter((p) => p.id !== tempId));
            setUiState((prev) => ({
              ...prev,
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
          },
          onError: () => {
            setPendingItems((prev) => prev.filter((p) => p.id !== tempId));
          },
        }
      );

      return tempId;
    },
    [createItemMutation]
  );

  const deleteItemHandler = React.useCallback(
    (id: string) => {
      setUiState((prev) => {
        const newExpandedIds = new Set(prev.expandedIds);
        newExpandedIds.delete(id);
        return {
          ...prev,
          expandedIds: newExpandedIds,
          selectedId: prev.selectedId === id ? null : prev.selectedId,
          renamingId: prev.renamingId === id ? null : prev.renamingId,
        };
      });
      deleteItemMutation.mutate(id);
    },
    [deleteItemMutation]
  );

  const moveItemHandler = React.useCallback(
    (itemId: string, newParentId: string | null) => {
      if (itemId === newParentId) return;

      if (newParentId) {
        setUiState((prev) => ({
          ...prev,
          expandedIds: new Set([...prev.expandedIds, newParentId]),
        }));
      }
      moveItemMutation.mutate({ itemId, newParentId });
    },
    [moveItemMutation]
  );

  const value = React.useMemo<FileTreeContextValue>(
    () => ({
      items,
      isLoading,
      ...uiState,
      toggleExpanded,
      expandTo,
      setSelectedId,
      startRenaming,
      finishRenaming,
      cancelRenaming,
      createFile,
      createFolder,
      deleteItem: deleteItemHandler,
      moveItem: moveItemHandler,
    }),
    [
      items,
      isLoading,
      uiState,
      toggleExpanded,
      expandTo,
      setSelectedId,
      startRenaming,
      finishRenaming,
      cancelRenaming,
      createFile,
      createFolder,
      deleteItemHandler,
      moveItemHandler,
    ]
  );

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  );
}
