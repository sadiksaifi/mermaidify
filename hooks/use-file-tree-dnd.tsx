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
} from "@/features/items/dnd-store";
import type { StoreApi } from "zustand";
import { findItemById, isDescendantOf } from "@/lib/file-tree-utils";

export const ROOT_DROPPABLE_ID = "__root__";

interface FileTreeDndProviderProps {
  children: React.ReactNode;
}

const FileTreeDndStoreContext = React.createContext<StoreApi<FileTreeDndStoreState> | null>(null);

export function FileTreeDndProvider({ children }: FileTreeDndProviderProps) {
  const moveItem = useFileTreeStore((s) => s.moveItem);
  const items = useFileTreeStore((s) => s.items);
  const selectedIds = useFileTreeStore((s) => s.selectedIds);
  const setSelectedId = useFileTreeStore((s) => s.setSelectedId);

  // Use refs to avoid stale closures in drag handlers
  const selectedIdsRef = React.useRef(selectedIds);
  const setSelectedIdRef = React.useRef(setSelectedId);
  const itemsRef = React.useRef(items);
  React.useEffect(() => {
    selectedIdsRef.current = selectedIds;
    setSelectedIdRef.current = setSelectedId;
    itemsRef.current = items;
  });

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
    const activeIdStr = String(event.active.id);
    state.setActiveId(event.active.id);
    const currentItems = itemsRef.current;
    const item = findItemById(currentItems, activeIdStr);
    state.setActiveItem(item);

    // Multi-drag: if dragged item is in selection and selection has 2+ items, drag all
    const currentSelectedIds = selectedIdsRef.current;
    if (currentSelectedIds.has(activeIdStr) && currentSelectedIds.size >= 2) {
      state.setDraggedIds(new Set(currentSelectedIds));
    } else {
      state.setDraggedIds(new Set([activeIdStr]));
      setSelectedIdRef.current(activeIdStr);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    store.getState().setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    const { draggedIds } = store.getState();
    const currentItems = itemsRef.current;

    if (over) {
      let newParentId: string | null = null;

      if (String(over.id) === ROOT_DROPPABLE_ID) {
        newParentId = null;
      } else {
        const targetItem = findItemById(currentItems, String(over.id));
        if (targetItem) {
          newParentId =
            targetItem.type === "folder" ? targetItem.id : targetItem.parentId;
        }
      }

      for (const draggedId of draggedIds) {
        if (draggedId === String(over.id)) continue;
        if (draggedId === newParentId) continue;
        if (newParentId && isDescendantOf(currentItems, newParentId, draggedId)) continue;

        const draggedItem = findItemById(currentItems, draggedId);
        if (!draggedItem) continue;

        // Skip if already in the target parent
        if (newParentId === null && draggedItem.parentId === null) continue;
        if (newParentId === draggedItem.parentId) continue;

        moveItem(draggedId, newParentId);
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
  const draggedCount = useFileTreeDnd((s) => s.draggedIds.size);
  if (!activeItem) return null;
  return (
    <div className="bg-sidebar-accent text-sidebar-accent-foreground rounded-lg px-3 py-2 text-sm shadow-lg opacity-80 flex items-center gap-2">
      <span>{draggedCount > 1 ? `${draggedCount} items` : activeItem.name}</span>
      {draggedCount > 1 && (
        <span className="bg-sidebar-primary text-sidebar-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-medium leading-none">
          {draggedCount}
        </span>
      )}
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
