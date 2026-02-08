import { createStore } from "zustand/vanilla";
import type { FileTreeItem } from "@/lib/types";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface FileTreeDndStoreState {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  activeItem: FileTreeItem | null;
  draggedIds: Set<string>;
  isDndEnabled: boolean;

  setActiveId: (id: UniqueIdentifier | null) => void;
  setOverId: (id: UniqueIdentifier | null) => void;
  setActiveItem: (item: FileTreeItem | null) => void;
  setDraggedIds: (ids: Set<string>) => void;
  setDndEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export function createFileTreeDndStore() {
  return createStore<FileTreeDndStoreState>((set) => ({
    activeId: null,
    overId: null,
    activeItem: null,
    draggedIds: new Set<string>(),
    isDndEnabled: false,

    setActiveId: (id) => set({ activeId: id }),
    setOverId: (id) => set({ overId: id }),
    setActiveItem: (item) => set({ activeItem: item }),
    setDraggedIds: (ids) => set({ draggedIds: ids }),
    setDndEnabled: (enabled) => set({ isDndEnabled: enabled }),
    reset: () => set({ activeId: null, overId: null, activeItem: null, draggedIds: new Set() }),
  }));
}
