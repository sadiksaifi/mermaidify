import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const nameSchema = z.string().trim().min(1).max(255);
export const contentSchema = z.string().max(1_000_000); // 1MB text limit

export const createItemSchema = z.object({
  parentId: uuidSchema.nullable(),
  name: nameSchema,
  isFolder: z.boolean(),
});

export const renameItemSchema = z.object({
  newName: nameSchema,
});

export const moveItemSchema = z.object({
  newParentId: uuidSchema.nullable(),
});

export const saveFileContentSchema = z.object({
  content: contentSchema,
});

/** Strip any .mmd suffix, then add it back — guarantees exactly one .mmd */
export function ensureMmdExtension(name: string): string {
  return name.replace(/\.mmd$/i, "") + ".mmd";
}
