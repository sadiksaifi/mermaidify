"use client";

import {
  IconPencil,
  IconTrash,
  IconFolder,
  IconCopy,
  IconDownload,
  IconFileTypeSvg,
  IconPhoto,
} from "@tabler/icons-react";
import { MermaidIcon } from "@/components/icons/mermaid-icon";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { downloadMmd, exportSvg, exportPng } from "@/lib/export-utils";
import type { FileTreeItem } from "@/lib/types";

interface FileTreeMenuItemsProps {
  item: FileTreeItem;
  MenuItem: React.ComponentType<{
    onClick?: () => void;
    variant?: "default" | "destructive";
    className?: string;
    children?: React.ReactNode;
  }>;
  MenuSeparator: React.ComponentType<{ className?: string }>;
  onAction?: () => void;
}

export function FileTreeMenuItems({
  item,
  MenuItem,
  MenuSeparator,
  onAction,
}: FileTreeMenuItemsProps) {
  const startRenaming = useFileTreeStore((s) => s.startRenaming);
  const deleteItem = useFileTreeStore((s) => s.deleteItem);
  const createFile = useFileTreeStore((s) => s.createFile);
  const createFolder = useFileTreeStore((s) => s.createFolder);
  const duplicateItem = useFileTreeStore((s) => s.duplicateItem);

  const isFolder = item.type === "folder";

  const wrap = (fn: () => void) => () => {
    fn();
    onAction?.();
  };

  return (
    <>
      {isFolder ? (
        <>
          <MenuItem onClick={wrap(() => createFile(item.id))}>
            <MermaidIcon />
            <span>New File</span>
          </MenuItem>
          <MenuItem onClick={wrap(() => createFolder(item.id))}>
            <IconFolder />
            <span>New Folder</span>
          </MenuItem>
          <MenuSeparator />
        </>
      ) : (
        <>
          <MenuItem onClick={wrap(() => createFile(item.parentId))}>
            <MermaidIcon />
            <span>New File</span>
          </MenuItem>
          <MenuItem onClick={wrap(() => createFolder(item.parentId))}>
            <IconFolder />
            <span>New Folder</span>
          </MenuItem>
          <MenuSeparator />
        </>
      )}
      <MenuItem onClick={wrap(() => startRenaming(item.id))}>
        <IconPencil />
        <span>Rename</span>
      </MenuItem>
      {!isFolder && (
        <MenuItem onClick={wrap(() => duplicateItem(item.id))}>
          <IconCopy />
          <span>Duplicate</span>
        </MenuItem>
      )}
      {!isFolder && (
        <>
          <MenuSeparator />
          <MenuItem onClick={wrap(() => downloadMmd(item.id, item.name))}>
            <IconDownload />
            <span>Download .mmd</span>
          </MenuItem>
          <MenuItem onClick={wrap(() => exportSvg(item.id, item.name))}>
            <IconFileTypeSvg />
            <span>Export as SVG</span>
          </MenuItem>
          <MenuItem onClick={wrap(() => exportPng(item.id, item.name))}>
            <IconPhoto />
            <span>Export as PNG</span>
          </MenuItem>
        </>
      )}
      <MenuSeparator />
      <MenuItem onClick={wrap(() => deleteItem(item.id))} variant="destructive">
        <IconTrash />
        <span>Delete</span>
      </MenuItem>
    </>
  );
}
