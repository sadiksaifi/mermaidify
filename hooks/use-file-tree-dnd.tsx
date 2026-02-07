"use client";

import * as React from "react";
import { useStore } from "zustand";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import {
  createFileTreeDndStore,
  type FileTreeDndStoreState,
} from "@/stores/file-tree-dnd-store";
import type { StoreApi } from "zustand";
import { findItemById } from "@/lib/file-tree-utils";

interface FileTreeDndProviderProps {
  children: React.ReactNode;
}

const FileTreeDndStoreContext = React.createContext<StoreApi<FileTreeDndStoreState> | null>(null);

export function FileTreeDndProvider({ children }: FileTreeDndProviderProps) {
  const moveItem = useFileTreeStore((s) => s.moveItem);
  const items = useFileTreeStore((s) => s.items);

  const [store] = React.useState(createFileTreeDndStore);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    store.getState().setDndEnabled(true);
  }, [store]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const state = store.getState();
    state.setActiveId(event.active.id);
    const item = findItemById(items, String(event.active.id));
    state.setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    store.getState().setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const targetItem = findItemById(items, String(over.id));

      if (targetItem) {
        const newParentId =
          targetItem.type === "folder" ? targetItem.id : targetItem.parentId;
        moveItem(String(active.id), newParentId);
      }
    }

    store.getState().reset();
  };

  const handleDragCancel = () => {
    store.getState().reset();
  };

  if (!mounted) {
    return (
      <FileTreeDndStoreContext.Provider value={store}>
        {children}
      </FileTreeDndStoreContext.Provider>
    );
  }

  return (
    <FileTreeDndStoreContext.Provider value={store}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          <DragOverlayContent />
        </DragOverlay>
      </DndContext>
    </FileTreeDndStoreContext.Provider>
  );
}

function DragOverlayContent() {
  const activeItem = useFileTreeDnd((s) => s.activeItem);
  if (!activeItem) return null;
  return (
    <div className="bg-sidebar-accent text-sidebar-accent-foreground rounded-lg px-3 py-2 text-sm shadow-lg opacity-80">
      {activeItem.name}
    </div>
  );
}

export function useFileTreeDnd<T>(selector: (state: FileTreeDndStoreState) => T): T {
  const store = React.useContext(FileTreeDndStoreContext);
  if (!store) {
    throw new Error("useFileTreeDnd must be used within a FileTreeDndProvider");
  }
  return useStore(store, selector);
}
