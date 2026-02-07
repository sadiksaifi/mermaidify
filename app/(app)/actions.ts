"use server";

import { db } from "@/db";
import { items, fileContents, fileVersions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, asc, desc } from "drizzle-orm";

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getUserFileTree() {
  const userId = await getAuthenticatedUserId();

  const rows = await db
    .select({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    })
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.isFolder), asc(items.name));

  return rows;
}

export async function createItem(
  parentId: string | null,
  name: string,
  isFolder: boolean
) {
  const userId = await getAuthenticatedUserId();

  const [newItem] = await db
    .insert(items)
    .values({
      userId,
      parentId,
      name,
      isFolder,
    })
    .returning({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    });

  // Create empty file_contents row for files
  if (!isFolder) {
    await db.insert(fileContents).values({
      itemId: newItem.id,
      content: "",
    });
  }

  return newItem;
}

export async function renameItem(itemId: string, newName: string) {
  const userId = await getAuthenticatedUserId();

  await db
    .update(items)
    .set({ name: newName, updatedAt: new Date() })
    .where(and(eq(items.id, itemId), eq(items.userId, userId)));
}

export async function moveItem(itemId: string, newParentId: string | null) {
  const userId = await getAuthenticatedUserId();

  await db
    .update(items)
    .set({ parentId: newParentId, updatedAt: new Date() })
    .where(and(eq(items.id, itemId), eq(items.userId, userId)));
}

export async function deleteItem(itemId: string) {
  const userId = await getAuthenticatedUserId();

  await db
    .delete(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)));
}

export async function getFileContent(itemId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership
  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [content] = await db
    .select({ content: fileContents.content })
    .from(fileContents)
    .where(eq(fileContents.itemId, itemId))
    .limit(1);

  return content?.content ?? "";
}

export async function saveFileContent(itemId: string, content: string) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership
  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  // Get current content to save as a version
  const [current] = await db
    .select({
      content: fileContents.content,
    })
    .from(fileContents)
    .where(eq(fileContents.itemId, itemId))
    .limit(1);

  if (current && current.content !== "") {
    // Get next version number
    const [lastVersion] = await db
      .select({ version: fileVersions.version })
      .from(fileVersions)
      .where(eq(fileVersions.itemId, itemId))
      .orderBy(desc(fileVersions.version))
      .limit(1);

    const nextVersion = (lastVersion?.version ?? 0) + 1;

    // Save previous content as a version
    await db.insert(fileVersions).values({
      itemId,
      content: current.content,
      version: nextVersion,
    });
  }

  // Upsert current content
  if (current) {
    await db
      .update(fileContents)
      .set({ content, updatedAt: new Date() })
      .where(eq(fileContents.itemId, itemId));
  } else {
    await db.insert(fileContents).values({ itemId, content });
  }
}
