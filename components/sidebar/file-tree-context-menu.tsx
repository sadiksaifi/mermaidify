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
import { useFileTree } from "@/hooks/use-file-tree";
import type { FileTreeItem } from "@/lib/mock-file-tree";

interface FileTreeContextMenuProps {
  item: FileTreeItem;
  children: React.ReactNode;
}

export function FileTreeContextMenu({ item, children }: FileTreeContextMenuProps) {
  const { startRenaming, deleteItem, createFile, createFolder } = useFileTree();

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
