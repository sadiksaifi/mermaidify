"use client";

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { FileTreeRow } from "./types";
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

export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old ? [...old, newItem] : [newItem],
      );
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
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old?.filter((item) => item.id !== itemId),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(itemKeys.list(), context.previous);
      }
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
    onSuccess: (newItem) => {
      queryClient.setQueryData<FileTreeRow[]>(itemKeys.list(), (old) =>
        old ? [...old, newItem] : [newItem],
      );
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
    },
  });
}
