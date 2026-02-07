"use server";

import { db } from "@/db";
import { items, fileContents, fileVersions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, asc, desc } from "drizzle-orm";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const nameSchema = z.string().trim().min(1).max(255);
const contentSchema = z.string().max(1_000_000); // 1MB text limit

/** Strip any .mmd suffix, then add it back — guarantees exactly one .mmd */
function ensureMmdExtension(name: string): string {
  return name.replace(/\.mmd$/i, "") + ".mmd";
}

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

const createItemSchema = z.object({
  parentId: uuidSchema.nullable(),
  name: nameSchema,
  isFolder: z.boolean(),
});

export async function createItem(
  parentId: string | null,
  name: string,
  isFolder: boolean
) {
  const input = createItemSchema.parse({ parentId, name, isFolder });
  const userId = await getAuthenticatedUserId();
  const finalName = input.isFolder ? input.name : ensureMmdExtension(input.name);

  const [newItem] = await db
    .insert(items)
    .values({
      userId,
      parentId: input.parentId,
      name: finalName,
      isFolder: input.isFolder,
    })
    .returning({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    });

  if (!input.isFolder) {
    await db.insert(fileContents).values({
      itemId: newItem.id,
      content: "",
    });
  }

  return newItem;
}

const renameItemSchema = z.object({
  itemId: uuidSchema,
  newName: nameSchema,
});

export async function renameItem(itemId: string, newName: string) {
  const input = renameItemSchema.parse({ itemId, newName });
  const userId = await getAuthenticatedUserId();

  // Look up whether item is a file to enforce .mmd extension
  const [item] = await db
    .select({ isFolder: items.isFolder })
    .from(items)
    .where(and(eq(items.id, input.itemId), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const finalName = item.isFolder ? input.newName : ensureMmdExtension(input.newName);

  await db
    .update(items)
    .set({ name: finalName, updatedAt: new Date() })
    .where(and(eq(items.id, input.itemId), eq(items.userId, userId)));
}

const moveItemSchema = z.object({
  itemId: uuidSchema,
  newParentId: uuidSchema.nullable(),
});

export async function moveItem(itemId: string, newParentId: string | null) {
  const input = moveItemSchema.parse({ itemId, newParentId });
  const userId = await getAuthenticatedUserId();

  await db
    .update(items)
    .set({ parentId: input.newParentId, updatedAt: new Date() })
    .where(and(eq(items.id, input.itemId), eq(items.userId, userId)));
}

export async function deleteItem(itemId: string) {
  const input = uuidSchema.parse(itemId);
  const userId = await getAuthenticatedUserId();

  await db
    .delete(items)
    .where(and(eq(items.id, input), eq(items.userId, userId)));
}

export async function getFileContent(itemId: string) {
  const input = uuidSchema.parse(itemId);
  const userId = await getAuthenticatedUserId();

  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, input), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [content] = await db
    .select({ content: fileContents.content })
    .from(fileContents)
    .where(eq(fileContents.itemId, input))
    .limit(1);

  return content?.content ?? "";
}

const saveFileContentSchema = z.object({
  itemId: uuidSchema,
  content: contentSchema,
});

export async function saveFileContent(itemId: string, content: string) {
  const input = saveFileContentSchema.parse({ itemId, content });
  const userId = await getAuthenticatedUserId();

  const [item] = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.id, input.itemId), eq(items.userId, userId)))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [current] = await db
    .select({
      content: fileContents.content,
    })
    .from(fileContents)
    .where(eq(fileContents.itemId, input.itemId))
    .limit(1);

  if (current && current.content !== "") {
    const [lastVersion] = await db
      .select({ version: fileVersions.version })
      .from(fileVersions)
      .where(eq(fileVersions.itemId, input.itemId))
      .orderBy(desc(fileVersions.version))
      .limit(1);

    const nextVersion = (lastVersion?.version ?? 0) + 1;

    await db.insert(fileVersions).values({
      itemId: input.itemId,
      content: current.content,
      version: nextVersion,
    });
  }

  if (current) {
    await db
      .update(fileContents)
      .set({ content: input.content, updatedAt: new Date() })
      .where(eq(fileContents.itemId, input.itemId));
  } else {
    await db.insert(fileContents).values({
      itemId: input.itemId,
      content: input.content,
    });
  }
}
