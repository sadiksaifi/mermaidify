"use client";

import { IconTrash, IconFolderShare } from "@tabler/icons-react";

interface MultiSelectMenuItemsProps {
  count: number;
  MenuItem: React.ComponentType<{
    onClick?: () => void;
    variant?: "default" | "destructive";
    className?: string;
    children?: React.ReactNode;
  }>;
  MenuSeparator: React.ComponentType<{ className?: string }>;
  onAction?: () => void;
  onMoveToClick: () => void;
  onDeleteClick: () => void;
}

export function MultiSelectMenuItems({
  count,
  MenuItem,
  MenuSeparator,
  onAction,
  onMoveToClick,
  onDeleteClick,
}: MultiSelectMenuItemsProps) {
  return (
    <>
      <MenuItem
        onClick={() => {
          onAction?.();
          onMoveToClick();
        }}
      >
        <IconFolderShare />
        <span>Move to...</span>
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        variant="destructive"
        onClick={() => {
          onAction?.();
          onDeleteClick();
        }}
      >
        <IconTrash />
        <span>Delete {count} items</span>
      </MenuItem>
    </>
  );
}
