import { createStore } from "zustand/vanilla";
import type { FileTreeItem } from "@/lib/types";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface FileTreeDndStoreState {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  activeItem: FileTreeItem | null;
  isDndEnabled: boolean;

  setActiveId: (id: UniqueIdentifier | null) => void;
  setOverId: (id: UniqueIdentifier | null) => void;
  setActiveItem: (item: FileTreeItem | null) => void;
  setDndEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export function createFileTreeDndStore() {
  return createStore<FileTreeDndStoreState>((set) => ({
    activeId: null,
    overId: null,
    activeItem: null,
    isDndEnabled: false,

    setActiveId: (id) => set({ activeId: id }),
    setOverId: (id) => set({ overId: id }),
    setActiveItem: (item) => set({ activeItem: item }),
    setDndEnabled: (enabled) => set({ isDndEnabled: enabled }),
    reset: () => set({ activeId: null, overId: null, activeItem: null }),
  }));
}
