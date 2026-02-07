"use client";

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
import { cn } from "@/lib/utils";
import type { FileTreeItem } from "@/lib/types";

interface FileTreeContextMenuProps {
  item: FileTreeItem;
  children: React.ReactNode;
}

const compactMenuItem = "rounded-md px-2 py-1.5 gap-2 text-xs";
const compactMenuContent = "rounded-lg p-1 w-48";

export function FileTreeContextMenu({
  item,
  children,
}: FileTreeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex-1">{children}</ContextMenuTrigger>
      <ContextMenuContent className={compactMenuContent}>
        <FileTreeMenuItems
          item={item}
          MenuItem={({ className, ...props }) => (
            <ContextMenuItem className={cn(compactMenuItem, className)} {...props} />
          )}
          MenuSeparator={ContextMenuSeparator}
        />
      </ContextMenuContent>
    </ContextMenu>
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          isSubItem ? (
            <button
              className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-0.5 right-1 aspect-square w-5 rounded-md p-0 flex items-center justify-center outline-hidden transition-opacity [&>svg]:size-4 [&>svg]:shrink-0",
                "group-focus-within/menu-sub-item:opacity-100 group-hover/menu-sub-item:opacity-100 aria-expanded:opacity-100 md:opacity-0"
              )}
            />
          ) : (
            <SidebarMenuAction showOnHover />
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
        <FileTreeMenuItems
          item={item}
          MenuItem={({ className, ...props }) => (
            <DropdownMenuItem className={cn(compactMenuItem, className)} {...props} />
          )}
          MenuSeparator={DropdownMenuSeparator}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
