"use client";

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { FileTreeRow, CreateItemInput } from "./types";
import {
  fetchItems,
  createItem,
  renameItem,
  moveItem,
  deleteItem,
  duplicateItem,
  fetchFileContent,
  saveFileContent,
} from "./http";
import { ensureMmdExtension } from "./validation";
import { generateCopyName } from "@/lib/file-tree-utils";

export const itemKeys = {
  all: ["items"] as const,
  list: () => [...itemKeys.all, "list"] as const,
  content: (id: string) => [...itemKeys.all, "content", id] as const,
};

export const itemsQueryOptions = queryOptions({
  queryKey: itemKeys.list(),
  queryFn: fetchItems,
});

export const fileContentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: itemKeys.content(id),
    queryFn: () => fetchFileContent(id),
  });

export function useItemsQuery() {
  return useQuery(itemsQueryOptions);
}

export function useFileContentQuery(id: string) {
  return useQuery(fileContentQueryOptions(id));
}

// --- Helpers ---

type CreateItemVars = CreateItemInput & { tempId?: string };

function getAllDescendantIds(rows: FileTreeRow[], parentId: string): Set<string> {
  const ids = new Set<string>();
  const queue = [parentId];
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const row of rows) {
      if (row.parentId === current && !ids.has(row.id)) {
        ids.add(row.id);
        queue.push(row.id);
      }
    }
  }
  return ids;
}

// --- Mutations ---

export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, name, isFolder }: CreateItemVars) =>
      createItem({ parentId, name, isFolder }),
    onMutate: async ({ tempId, parentId, name, isFolder }) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list() });
      const previous = queryClient.getQueryData<FileTreeRow[]>(itemKeys.list());

      if (tempId) {
        const tempRow: FileTreeRow = {
          id: tempId,
          parentId,
          name: isFolder ? name : ensureMmdExtension(name),
          isFolder,
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
          old ? [...old, tempRow] : [tempRow],
        );
      }

      return { previous, tempId };
    },
    onSuccess: (realItem, _vars, context) => {
      // Replace temp item with real item in list cache
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old?.map((item) =>
          item.id === context?.tempId ? realItem : item,
        ),
      );
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
      toast.error("Failed to create item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}

export function useRenameItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      newName,
    }: {
      itemId: string;
      newName: string;
    }) => renameItem(itemId, { newName }),
    onMutate: async ({ itemId, newName }) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list() });
      const previous = queryClient.getQueryData<FileTreeRow[]>(itemKeys.list());
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, name: newName } : item,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
      toast.error("Failed to rename item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}

export function useMoveItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      newParentId,
    }: {
      itemId: string;
      newParentId: string | null;
    }) => moveItem(itemId, { newParentId }),
    onMutate: async ({ itemId, newParentId }) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list() });
      const previous = queryClient.getQueryData<FileTreeRow[]>(itemKeys.list());
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, parentId: newParentId } : item,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
      toast.error("Failed to move item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => deleteItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list() });
      const previous = queryClient.getQueryData<FileTreeRow[]>(itemKeys.list());
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) => {
        if (!old) return old;
        const descendantIds = getAllDescendantIds(old, itemId);
        return old.filter(
          (item) => item.id !== itemId && !descendantIds.has(item.id),
        );
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
      toast.error("Failed to delete item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}

export function useDuplicateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => duplicateItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: itemKeys.list() });
      const previous = queryClient.getQueryData<FileTreeRow[]>(itemKeys.list());

      if (previous) {
        const original = previous.find((item) => item.id === itemId);
        if (original && !original.isFolder) {
          const siblings = previous.filter(
            (item) => item.parentId === original.parentId,
          );
          const copyName = generateCopyName(
            original.name,
            siblings.map((s) => s.name),
          );
          const tempItem: FileTreeRow = {
            id: crypto.randomUUID(),
            parentId: original.parentId,
            name: copyName,
            isFolder: false,
            updatedAt: new Date().toISOString(),
          };
          queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), [
            ...previous,
            tempItem,
          ]);
        }
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
      toast.error("Failed to duplicate item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}

export function useSaveFileContentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      content,
    }: {
      itemId: string;
      content: string;
    }) => saveFileContent(itemId, { content }),
    onSettled: (_data, _err, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.content(itemId) });
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
    },
  });
}
