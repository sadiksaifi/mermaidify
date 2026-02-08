"use client";

import * as React from "react";
import { IconTrash, IconFolderShare } from "@tabler/icons-react";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { MoveToDialog } from "./move-to-dialog";

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
}

export function MultiSelectMenuItems({
  count,
  MenuItem,
  MenuSeparator,
  onAction,
}: MultiSelectMenuItemsProps) {
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <MenuItem
        onClick={() => {
          onAction?.();
          setShowMoveDialog(true);
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
          setShowDeleteDialog(true);
        }}
      >
        <IconTrash />
        <span>Delete {count} items</span>
      </MenuItem>
      <MoveToDialog open={showMoveDialog} onOpenChange={setShowMoveDialog} />
      <BulkDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        count={count}
      />
    </>
  );
}
