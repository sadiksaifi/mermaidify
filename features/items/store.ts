import { createStore } from "zustand/vanilla";
import type { FileTreeItem } from "@/lib/types";
import type { FileTreeRow } from "./types";
import { buildTreeFromFlatList, getParentIds } from "@/lib/file-tree-utils";

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

function computeItems(
  rows: FileTreeRow[] | undefined,
  pendingItems: FileTreeItem[]
): FileTreeItem[] {
  const serverTree = rows ? buildTreeFromFlatList(rows) : [];
  let tree = serverTree;
  for (const pending of pendingItems) {
    tree = addItemToTree(tree, pending.parentId, pending);
  }
  return tree;
}

// Mutation function signatures matching TanStack Query's .mutate()
interface Mutations {
  createItem: (
    input: { parentId: string | null; name: string; isFolder: boolean },
    options?: {
      onSuccess?: (dbItem: FileTreeRow) => void;
      onError?: () => void;
    }
  ) => void;
  renameItem: (input: { itemId: string; newName: string }) => void;
  moveItem: (input: { itemId: string; newParentId: string | null }) => void;
  deleteItem: (id: string) => void;
}

export interface FileTreeStoreState {
  // Public state
  expandedIds: Set<string>;
  selectedId: string | null;
  renamingId: string | null;
  pendingItems: FileTreeItem[];
  items: FileTreeItem[];
  isLoading: boolean;

  // Internal (synced from provider)
  _rows: FileTreeRow[] | undefined;
  _mutations: Mutations | null;

  // Actions
  toggleExpanded: (id: string) => void;
  expandTo: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  startRenaming: (id: string) => void;
  finishRenaming: (id: string, newName: string) => void;
  cancelRenaming: () => void;
  createFile: (parentId: string | null, name?: string) => string;
  createFolder: (parentId: string | null, name?: string) => string;
  deleteItem: (id: string) => void;
  moveItem: (itemId: string, newParentId: string | null) => void;

  // Sync methods (called by provider)
  _syncData: (rows: FileTreeRow[] | undefined, isLoading: boolean) => void;
  _syncMutations: (mutations: Mutations) => void;
}

export function createFileTreeStore() {
  return createStore<FileTreeStoreState>((set, get) => ({
    // Initial state
    expandedIds: new Set<string>(),
    selectedId: null,
    renamingId: null,
    pendingItems: [],
    items: [],
    isLoading: true,

    _rows: undefined,
    _mutations: null,

    // Actions
    toggleExpanded: (id) => {
      set((state) => {
        const newExpandedIds = new Set(state.expandedIds);
        if (newExpandedIds.has(id)) {
          newExpandedIds.delete(id);
        } else {
          newExpandedIds.add(id);
        }
        return { expandedIds: newExpandedIds };
      });
    },

    expandTo: (id) => {
      const { items } = get();
      const parentIds = getParentIds(items, id);
      set((state) => {
        const newExpandedIds = new Set(state.expandedIds);
        parentIds.forEach((parentId) => newExpandedIds.add(parentId));
        return { expandedIds: newExpandedIds };
      });
    },

    setSelectedId: (id) => {
      set({ selectedId: id });
    },

    startRenaming: (id) => {
      set({ renamingId: id });
    },

    finishRenaming: (id, newName) => {
      set({ renamingId: null });
      get()._mutations?.renameItem({ itemId: id, newName });
    },

    cancelRenaming: () => {
      set({ renamingId: null });
    },

    createFile: (parentId, name = "Untitled.mmd") => {
      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "file",
        parentId,
      };

      set((state) => {
        const newPending = [...state.pendingItems, newItem];
        return {
          pendingItems: newPending,
          items: computeItems(state._rows, newPending),
          renamingId: tempId,
        };
      });

      get()._mutations?.createItem(
        { parentId, name, isFolder: false },
        {
          onSuccess: (dbItem) => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== tempId
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
                renamingId:
                  state.renamingId === tempId ? dbItem.id : state.renamingId,
                selectedId:
                  state.selectedId === tempId ? dbItem.id : state.selectedId,
              };
            });
          },
          onError: () => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== tempId
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
              };
            });
          },
        }
      );

      return tempId;
    },

    createFolder: (parentId, name = "New Folder") => {
      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "folder",
        parentId,
        children: [],
      };

      set((state) => {
        const newPending = [...state.pendingItems, newItem];
        return {
          pendingItems: newPending,
          items: computeItems(state._rows, newPending),
          expandedIds: parentId
            ? new Set([...state.expandedIds, parentId])
            : state.expandedIds,
          renamingId: tempId,
        };
      });

      get()._mutations?.createItem(
        { parentId, name, isFolder: true },
        {
          onSuccess: (dbItem) => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== tempId
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
                renamingId:
                  state.renamingId === tempId ? dbItem.id : state.renamingId,
                selectedId:
                  state.selectedId === tempId ? dbItem.id : state.selectedId,
                expandedIds: state.expandedIds.has(tempId)
                  ? new Set(
                      [...state.expandedIds].map((id) =>
                        id === tempId ? dbItem.id : id
                      )
                    )
                  : state.expandedIds,
              };
            });
          },
          onError: () => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== tempId
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
              };
            });
          },
        }
      );

      return tempId;
    },

    deleteItem: (id) => {
      set((state) => {
        const newExpandedIds = new Set(state.expandedIds);
        newExpandedIds.delete(id);
        return {
          expandedIds: newExpandedIds,
          selectedId: state.selectedId === id ? null : state.selectedId,
          renamingId: state.renamingId === id ? null : state.renamingId,
        };
      });
      get()._mutations?.deleteItem(id);
    },

    moveItem: (itemId, newParentId) => {
      if (itemId === newParentId) return;

      if (newParentId) {
        set((state) => ({
          expandedIds: new Set([...state.expandedIds, newParentId]),
        }));
      }
      get()._mutations?.moveItem({ itemId, newParentId });
    },

    // Sync methods
    _syncData: (rows, isLoading) => {
      set((state) => ({
        _rows: rows,
        isLoading,
        items: computeItems(rows, state.pendingItems),
      }));
    },

    _syncMutations: (mutations) => {
      set({ _mutations: mutations });
    },
  }));
}
