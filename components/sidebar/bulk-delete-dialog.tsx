"use client";

import { useRouter } from "next/navigation";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  count,
}: BulkDeleteDialogProps) {
  const router = useRouter();
  const deleteSelectedItems = useFileTreeStore((s) => s.deleteSelectedItems);

  const handleConfirm = () => {
    router.push("/");
    deleteSelectedItems();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {count} items?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the selected items. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
