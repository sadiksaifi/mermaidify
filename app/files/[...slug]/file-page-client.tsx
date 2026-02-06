"use client";

import { useEffect } from "react";
import { useFileTree } from "@/hooks/use-file-tree";

interface FilePageClientProps {
  itemId: string;
  itemName: string;
}

export function FilePageClient({ itemId, itemName }: FilePageClientProps) {
  const { setSelectedId, expandTo } = useFileTree();

  // Sync selection and expand folders to reveal the file
  useEffect(() => {
    setSelectedId(itemId);
    expandTo(itemId);
  }, [itemId, setSelectedId, expandTo]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">{itemName}</h1>
      <p className="text-muted-foreground">
        This is a placeholder for the file content. In a real application, this
        would display the actual content of the file.
      </p>
    </div>
  );
}
