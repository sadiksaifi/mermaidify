"use client";

import * as React from "react";
import { IconDots } from "@tabler/icons-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import { FileTreeMenuItems } from "./file-tree-menu-items";
import { MultiSelectMenuItems } from "./file-tree-multi-select-menu-items";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { MoveToDialog } from "./move-to-dialog";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { cn } from "@/lib/utils";
import type { FileTreeItem } from "@/lib/types";

interface FileTreeContextMenuProps {
  item: FileTreeItem;
  children: React.ReactNode;
}

const compactMenuItem = "!rounded-sm px-2 py-1.5 gap-2 text-xs";
const compactMenuContent = "!rounded-md p-1 w-48";

export function FileTreeContextMenu({
  item,
  children,
}: FileTreeContextMenuProps) {
  const selectedIds = useFileTreeStore((s) => s.selectedIds);
  const setSelectedId = useFileTreeStore((s) => s.setSelectedId);
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const isMultiSelected = selectedIds.size > 1 && selectedIds.has(item.id);

  const handleContextMenu = () => {
    // If right-clicking an unselected item, clear selection and select just this item
    if (!selectedIds.has(item.id)) {
      setSelectedId(item.id);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex-1" onContextMenu={handleContextMenu}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className={compactMenuContent}>
          {isMultiSelected ? (
            <MultiSelectMenuItems
              count={selectedIds.size}
              MenuItem={({ className, ...props }) => (
                <ContextMenuItem className={cn(compactMenuItem, className)} {...props} />
              )}
              MenuSeparator={ContextMenuSeparator}
              onMoveToClick={() => setShowMoveDialog(true)}
              onDeleteClick={() => setShowDeleteDialog(true)}
            />
          ) : (
            <FileTreeMenuItems
              item={item}
              MenuItem={({ className, ...props }) => (
                <ContextMenuItem className={cn(compactMenuItem, className)} {...props} />
              )}
              MenuSeparator={ContextMenuSeparator}
            />
          )}
        </ContextMenuContent>
      </ContextMenu>
      <MoveToDialog open={showMoveDialog} onOpenChange={setShowMoveDialog} />
      <BulkDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        count={selectedIds.size}
      />
    </>
  );
}

interface FileTreeItemActionsProps {
  item: FileTreeItem;
  isSubItem?: boolean;
}

export function FileTreeItemActions({
  item,
  isSubItem = false,
}: FileTreeItemActionsProps) {
  const selectedIds = useFileTreeStore((s) => s.selectedIds);
  const isMultiSelected = selectedIds.size > 1 && selectedIds.has(item.id);
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            isSubItem ? (
              <button
                className={cn(
                  "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1 right-1 aspect-square w-5 rounded-md p-0 flex items-center justify-center outline-hidden transition-opacity [&>svg]:size-4 [&>svg]:shrink-0",
                  "group-focus-within/menu-sub-item:opacity-100 group-hover/menu-sub-item:opacity-100 aria-expanded:opacity-100 md:opacity-0"
                )}
              />
            ) : (
              <SidebarMenuAction showOnHover className="!top-1" />
            )
          }
        >
          <IconDots />
          <span className="sr-only">More</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          className={compactMenuContent}
        >
          {isMultiSelected ? (
            <MultiSelectMenuItems
              count={selectedIds.size}
              MenuItem={({ className, ...props }) => (
                <DropdownMenuItem className={cn(compactMenuItem, className)} {...props} />
              )}
              MenuSeparator={DropdownMenuSeparator}
              onMoveToClick={() => setShowMoveDialog(true)}
              onDeleteClick={() => setShowDeleteDialog(true)}
            />
          ) : (
            <FileTreeMenuItems
              item={item}
              MenuItem={({ className, ...props }) => (
                <DropdownMenuItem className={cn(compactMenuItem, className)} {...props} />
              )}
              MenuSeparator={DropdownMenuSeparator}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <MoveToDialog open={showMoveDialog} onOpenChange={setShowMoveDialog} />
      <BulkDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        count={selectedIds.size}
      />
    </>
  );
}
