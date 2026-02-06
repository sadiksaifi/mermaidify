"use client";

import * as React from "react";
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
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useFileTree } from "@/hooks/use-file-tree";
import type { FileTreeItem } from "@/lib/mock-file-tree";

interface FileTreeDndProviderProps {
  children: React.ReactNode;
}

export function FileTreeDndProvider({ children }: FileTreeDndProviderProps) {
  const { moveItem, findById } = useFileTree();
  const [mounted, setMounted] = React.useState(false);
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = React.useState<UniqueIdentifier | null>(null);

  // Only enable DnD after hydration to avoid mismatched aria-describedby IDs
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeItem = activeId ? findById(String(activeId)) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const targetItem = findById(String(over.id));

      // If dropping on a folder, move into it
      // If dropping on a file, move to its parent
      if (targetItem) {
        const newParentId =
          targetItem.type === "folder" ? targetItem.id : targetItem.parentId;
        moveItem(String(active.id), newParentId);
      }
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Before hydration, render children without DnD to avoid hydration mismatch
  if (!mounted) {
    return (
      <FileTreeDndContext.Provider value={{ activeId: null, overId: null, activeItem: null, isDndEnabled: false }}>
        {children}
      </FileTreeDndContext.Provider>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <FileTreeDndContext.Provider value={{ activeId, overId, activeItem, isDndEnabled: true }}>
        {children}
      </FileTreeDndContext.Provider>
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="bg-sidebar-accent text-sidebar-accent-foreground rounded-lg px-3 py-2 text-sm shadow-lg opacity-80">
            {activeItem.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface FileTreeDndContextValue {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  activeItem: FileTreeItem | null;
  isDndEnabled: boolean;
}

const FileTreeDndContext = React.createContext<FileTreeDndContextValue>({
  activeId: null,
  overId: null,
  activeItem: null,
  isDndEnabled: false,
});

export function useFileTreeDnd() {
  return React.useContext(FileTreeDndContext);
}
