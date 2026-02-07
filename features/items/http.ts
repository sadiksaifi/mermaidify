import { appFetch } from "@/lib/app-fetch";
import type {
  FileTreeRow,
  CreateItemInput,
  RenameItemInput,
  MoveItemInput,
  SaveContentInput,
  FileContent,
} from "./types";

export const fetchItems = () =>
  appFetch<FileTreeRow[]>("/api/items");

export const createItem = (input: CreateItemInput) =>
  appFetch<FileTreeRow>("/api/items", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const renameItem = (itemId: string, input: RenameItemInput) =>
  appFetch<void>(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const moveItem = (itemId: string, input: MoveItemInput) =>
  appFetch<void>(`/api/items/${itemId}/move`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteItem = (itemId: string) =>
  appFetch<void>(`/api/items/${itemId}`, { method: "DELETE" });

export const fetchFileContent = (itemId: string) =>
  appFetch<FileContent>(`/api/items/${itemId}/content`);

export const saveFileContent = (itemId: string, input: SaveContentInput) =>
  appFetch<void>(`/api/items/${itemId}/content`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
