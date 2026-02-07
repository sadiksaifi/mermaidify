import { db } from "@/db";
import { items, fileContents, fileVersions } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import type { FileTreeRow, FileContent } from "./types";
import {
  createItemSchema,
  renameItemSchema,
  moveItemSchema,
  uuidSchema,
  saveFileContentSchema,
  ensureMmdExtension,
} from "./validation";

export async function listItems(userId: string): Promise<FileTreeRow[]> {
  return db
    .select({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    })
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.isFolder), asc(items.name));
}

export async function createItem(
  userId: string,
  input: unknown,
): Promise<FileTreeRow> {
  const data = createItemSchema.parse(input);
  const finalName = data.isFolder
    ? data.name
    : ensureMmdExtension(data.name);

  const [newItem] = await db
    .insert(items)
    .values({
      userId,
      parentId: data.parentId,
      name: finalName,
      isFolder: data.isFolder,
    })
    .returning({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    });

  if (!data.isFolder) {
    await db.insert(fileContents).values({
      itemId: newItem.id,
      content: "",
    });
  }

  return newItem;
}

export async function renameItem(
  userId: string,
  itemId: string,
  input: unknown,
): Promise<void> {
  const id = uuidSchema.parse(itemId);
  const { newName } = renameItemSchema.parse(input);

  const [item] = await db
    .select({ isFolder: items.isFolder })
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const finalName = item.isFolder ? newName : ensureMmdExtension(newName);

  await db
    .update(items)
    .set({ name: finalName, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
}

export async function moveItem(
  userId: string,
  itemId: string,
  input: unknown,
): Promise<void> {
  const id = uuidSchema.parse(itemId);
  const { newParentId } = moveItemSchema.parse(input);

  await db
    .update(items)
    .set({ parentId: newParentId, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
}

export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const id = uuidSchema.parse(itemId);

  await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)));
}

export async function getFileContent(
  userId: string,
  itemId: string,
): Promise<FileContent> {
  const id = uuidSchema.parse(itemId);

  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [content] = await db
    .select({ content: fileContents.content })
    .from(fileContents)
    .where(eq(fileContents.itemId, id))
    .limit(1);

  return { content: content?.content ?? "" };
}

export async function saveFileContent(
  userId: string,
  itemId: string,
  input: unknown,
): Promise<void> {
  const id = uuidSchema.parse(itemId);
  const { content } = saveFileContentSchema.parse(input);

  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [current] = await db
    .select({ content: fileContents.content })
    .from(fileContents)
    .where(eq(fileContents.itemId, id))
    .limit(1);

  if (current && current.content !== "") {
    const [lastVersion] = await db
      .select({ version: fileVersions.version })
      .from(fileVersions)
      .where(eq(fileVersions.itemId, id))
      .orderBy(desc(fileVersions.version))
      .limit(1);

    const nextVersion = (lastVersion?.version ?? 0) + 1;

    await db.insert(fileVersions).values({
      itemId: id,
      content: current.content,
      version: nextVersion,
    });
  }

  if (current) {
    await db
      .update(fileContents)
      .set({ content, updatedAt: new Date() })
      .where(eq(fileContents.itemId, id));
  } else {
    await db.insert(fileContents).values({
      itemId: id,
      content,
    });
  }
}
