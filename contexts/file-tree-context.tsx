"use client";

import * as React from "react";
import { useStore } from "zustand";
import {
  createFileTreeStore,
  type FileTreeStoreState,
} from "@/features/items/store";
import type { StoreApi } from "zustand";
import {
  useItemsQuery,
  useCreateItemMutation,
  useRenameItemMutation,
  useMoveItemMutation,
  useDeleteItemMutation,
  useDuplicateItemMutation,
} from "@/features/items/query";

const FileTreeStoreContext = React.createContext<StoreApi<FileTreeStoreState> | null>(null);

export function FileTreeProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(createFileTreeStore);

  const { data: rows, isLoading } = useItemsQuery();
  const createItemMutation = useCreateItemMutation();
  const renameItemMutation = useRenameItemMutation();
  const moveItemMutation = useMoveItemMutation();
  const deleteItemMutation = useDeleteItemMutation();
  const duplicateItemMutation = useDuplicateItemMutation();

  // Sync TQ data into the store
  React.useEffect(() => {
    store.getState()._syncData(rows, isLoading);
  }, [store, rows, isLoading]);

  // Sync mutation functions into the store
  React.useEffect(() => {
    store.getState()._syncMutations({
      createItem: (input, options) => createItemMutation.mutate(input, options),
      renameItem: (input) => renameItemMutation.mutate(input),
      moveItem: (input) => moveItemMutation.mutate(input),
      deleteItem: (id) => deleteItemMutation.mutate(id),
      duplicateItem: (id, options) => duplicateItemMutation.mutate(id, options),
    });
  }, [store, createItemMutation, renameItemMutation, moveItemMutation, deleteItemMutation, duplicateItemMutation]);

  return (
    <FileTreeStoreContext.Provider value={store}>
      {children}
    </FileTreeStoreContext.Provider>
  );
}

export function useFileTreeStore<T>(selector: (state: FileTreeStoreState) => T): T {
  const store = React.useContext(FileTreeStoreContext);
  if (!store) {
    throw new Error("useFileTreeStore must be used within a FileTreeProvider");
  }
  return useStore(store, selector);
}

// Backward-compatible: subscribes to entire store
export function useFileTreeContext() {
  return useFileTreeStore((s) => s);
}
