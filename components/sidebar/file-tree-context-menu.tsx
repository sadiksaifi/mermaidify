"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  Delete02Icon,
  File01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import type { FileTreeItem } from "@/lib/types";

interface FileTreeContextMenuProps {
  item: FileTreeItem;
  children: React.ReactNode;
}

export function FileTreeContextMenu({ item, children }: FileTreeContextMenuProps) {
  // Action-only subscriptions — stable refs, no re-renders from state changes
  const startRenaming = useFileTreeStore((s) => s.startRenaming);
  const deleteItem = useFileTreeStore((s) => s.deleteItem);
  const createFile = useFileTreeStore((s) => s.createFile);
  const createFolder = useFileTreeStore((s) => s.createFolder);

  const handleRename = () => {
    startRenaming(item.id);
  };

  const handleDelete = () => {
    deleteItem(item.id);
  };

  const handleNewFile = () => {
    createFile(item.id);
  };

  const handleNewFolder = () => {
    createFolder(item.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex-1">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {item.type === "folder" && (
          <>
            <ContextMenuItem onClick={handleNewFile}>
              <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
              <span>New File</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleNewFolder}>
              <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
              <span>New Folder</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={handleRename}>
          <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
