"use client";

import { useRouter } from "next/navigation";
import {
  useCreateItemMutation,
  useSaveFileContentMutation,
} from "@/features/items/query";
import { slugify } from "@/lib/file-tree-utils";
import type { DiagramTemplate } from "@/lib/templates";

export function useCreateFromTemplate() {
  const router = useRouter();
  const createMutation = useCreateItemMutation();
  const saveMutation = useSaveFileContentMutation();

  function createFromTemplate(template: DiagramTemplate) {
    const fileName = template.id === "blank" ? "Untitled" : template.name;

    createMutation.mutate(
      { parentId: null, name: fileName, isFolder: false },
      {
        onSuccess: (newItem) => {
          if (template.content) {
            saveMutation.mutate({
              itemId: newItem.id,
              content: template.content,
            });
          }
          router.push(`/files/${slugify(newItem.name)}`);
        },
      },
    );
  }

  return {
    createFromTemplate,
    isPending: createMutation.isPending,
  };
}
