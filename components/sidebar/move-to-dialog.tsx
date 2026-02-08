"use client";

import * as React from "react";
import { IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { isDescendantOf } from "@/lib/file-tree-utils";
import type { FileTreeItem } from "@/lib/types";

interface MoveToDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function collectFolders(items: FileTreeItem[]): FileTreeItem[] {
  const folders: FileTreeItem[] = [];
  for (const item of items) {
    if (item.type === "folder") {
      folders.push(item);
      if (item.children) {
        folders.push(...collectFolders(item.children));
      }
    }
  }
  return folders;
}

export function MoveToDialog({ open, onOpenChange }: MoveToDialogProps) {
  const items = useFileTreeStore((s) => s.items);
  const selectedIds = useFileTreeStore((s) => s.selectedIds);
  const moveSelectedItems = useFileTreeStore((s) => s.moveSelectedItems);
  const [targetId, setTargetId] = React.useState<string | null>(null);

  const allFolders = React.useMemo(() => collectFolders(items), [items]);

  // Filter out invalid targets: folders that are selected or descendants of selected items
  const validFolders = React.useMemo(() => {
    return allFolders.filter((folder) => {
      if (selectedIds.has(folder.id)) return false;
      for (const id of selectedIds) {
        if (isDescendantOf(items, folder.id, id)) return false;
      }
      return true;
    });
  }, [allFolders, selectedIds, items]);

  const handleMove = () => {
    moveSelectedItems(targetId);
    onOpenChange(false);
    setTargetId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>
            Select a destination folder for the {selectedIds.size} selected items.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-64">
          <div className="flex flex-col gap-0.5 pr-3">
            <button
              onClick={() => setTargetId(null)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent",
                targetId === null && "bg-accent"
              )}
            >
              <IconFolderOpen className="size-4 shrink-0" />
              <span>Root</span>
            </button>
            {validFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setTargetId(folder.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent",
                  targetId === folder.id && "bg-accent"
                )}
              >
                <IconFolder className="size-4 shrink-0" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
