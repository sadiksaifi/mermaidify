"use client";

import * as React from "react";
import { IconPlus, IconFolder } from "@tabler/icons-react";
import { MermaidIcon } from "@/components/icons/mermaid-icon";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDroppable } from "@dnd-kit/core";
import { SidebarFileTreeItem } from "./sidebar-file-tree-item";
import { useFileTree } from "@/hooks/use-file-tree";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { FileTreeDndProvider, ROOT_DROPPABLE_ID, useFileTreeDnd } from "@/hooks/use-file-tree-dnd";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function RootDropZone() {
  const activeId = useFileTreeDnd((s) => s.activeId);
  const clearSelection = useFileTreeStore((s) => s.clearSelection);
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROPPABLE_ID });
  const showIndicator = isOver && activeId;

  return (
    <div
      ref={setNodeRef}
      onClick={clearSelection}
      className={cn(
        "flex-1 min-h-8",
        showIndicator && "bg-sidebar-accent/50 ring-1 ring-dashed ring-sidebar-ring rounded-[3px] m-1"
      )}
    />
  );
}

export function SidebarFileTree() {
  const { items, createFile, createFolder } = useFileTree();
  const clearSelection = useFileTreeStore((s) => s.clearSelection);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return (
    <SidebarContent>
      <ScrollArea className="h-full">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pr-1">
          <SidebarGroupLabel>
            Files
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarGroupAction>
                    <IconPlus />
                    <span className="sr-only">Add new</span>
                  </SidebarGroupAction>
                }
              />
              <DropdownMenuContent side="right" align="start" className="!rounded-md p-1">
                <DropdownMenuItem onClick={() => createFile(null)} className="!rounded-sm px-2 py-1.5 gap-2 text-xs">
                  <MermaidIcon />
                  <span>New File</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createFolder(null)} className="!rounded-sm px-2 py-1.5 gap-2 text-xs">
                  <IconFolder />
                  <span>New Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <FileTreeDndProvider>
              <SidebarMenu className="gap-0.5">
                {items.map((item) => (
                  <SidebarFileTreeItem key={item.id} item={item} />
                ))}
              </SidebarMenu>
              <RootDropZone />
            </FileTreeDndProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </ScrollArea>
    </SidebarContent>
  );
}
