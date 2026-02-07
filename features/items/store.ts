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
  duplicateItem: (
    id: string,
    options?: { onSuccess?: (dbItem: FileTreeRow) => void }
  ) => void;
}

export interface FileTreeStoreState {
  // Public state
  expandedIds: Set<string>;
  selectedId: string | null;
  renamingId: string | null;
  creatingIds: Set<string>;
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
  confirmCreate: (id: string, name: string) => void;
  abortCreate: (id: string) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => void;
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
    creatingIds: new Set<string>(),
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
      // Auto-abort any existing in-progress creation
      const { creatingIds } = get();
      for (const existingId of creatingIds) {
        get().abortCreate(existingId);
      }

      const tempId = crypto.randomUUID();
      const newItem: FileTreeItem = {
        id: tempId,
        name,
        type: "file",
        parentId,
      };

      set((state) => {
        const newPending = [...state.pendingItems, newItem];
        const newCreatingIds = new Set(state.creatingIds);
        newCreatingIds.add(tempId);
        return {
          pendingItems: newPending,
          items: computeItems(state._rows, newPending),
          renamingId: tempId,
          creatingIds: newCreatingIds,
        };
      });

      return tempId;
    },

    createFolder: (parentId, name = "New Folder") => {
      // Auto-abort any existing in-progress creation
      const { creatingIds } = get();
      for (const existingId of creatingIds) {
        get().abortCreate(existingId);
      }

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
        const newCreatingIds = new Set(state.creatingIds);
        newCreatingIds.add(tempId);
        return {
          pendingItems: newPending,
          items: computeItems(state._rows, newPending),
          expandedIds: parentId
            ? new Set([...state.expandedIds, parentId])
            : state.expandedIds,
          renamingId: tempId,
          creatingIds: newCreatingIds,
        };
      });

      return tempId;
    },

    confirmCreate: (id, name) => {
      const { pendingItems, creatingIds } = get();
      if (!creatingIds.has(id)) return;

      const pending = pendingItems.find((p) => p.id === id);
      if (!pending) return;

      const isFolder = pending.type === "folder";

      // Remove from creatingIds
      set((state) => {
        const newCreatingIds = new Set(state.creatingIds);
        newCreatingIds.delete(id);
        return {
          renamingId: state.renamingId === id ? null : state.renamingId,
          creatingIds: newCreatingIds,
        };
      });

      // Fire the mutation
      get()._mutations?.createItem(
        { parentId: pending.parentId, name, isFolder },
        {
          onSuccess: (dbItem) => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== id
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
                renamingId:
                  state.renamingId === id ? dbItem.id : state.renamingId,
                selectedId:
                  state.selectedId === id ? dbItem.id : state.selectedId,
                expandedIds: state.expandedIds.has(id)
                  ? new Set(
                      [...state.expandedIds].map((eid) =>
                        eid === id ? dbItem.id : eid
                      )
                    )
                  : state.expandedIds,
              };
            });
          },
          onError: () => {
            set((state) => {
              const newPending = state.pendingItems.filter(
                (p) => p.id !== id
              );
              return {
                pendingItems: newPending,
                items: computeItems(state._rows, newPending),
              };
            });
          },
        }
      );
    },

    abortCreate: (id) => {
      set((state) => {
        if (!state.creatingIds.has(id)) return state;

        const newPending = state.pendingItems.filter((p) => p.id !== id);
        const newCreatingIds = new Set(state.creatingIds);
        newCreatingIds.delete(id);
        const newExpandedIds = new Set(state.expandedIds);
        newExpandedIds.delete(id);

        return {
          pendingItems: newPending,
          items: computeItems(state._rows, newPending),
          creatingIds: newCreatingIds,
          expandedIds: newExpandedIds,
          renamingId: state.renamingId === id ? null : state.renamingId,
          selectedId: state.selectedId === id ? null : state.selectedId,
        };
      });
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

    duplicateItem: (id) => {
      get()._mutations?.duplicateItem(id);
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
