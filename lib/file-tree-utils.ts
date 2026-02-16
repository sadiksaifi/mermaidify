import type { FileTreeItem } from "./types";

/**
 * Return a flat ordered list of visible items (items inside collapsed folders are excluded).
 * Used for shift+click range selection.
 */
export function flattenVisibleTree(
  items: FileTreeItem[],
  expandedIds: Set<string>
): FileTreeItem[] {
  const result: FileTreeItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.type === "folder" && expandedIds.has(item.id) && item.children) {
      result.push(...flattenVisibleTree(item.children, expandedIds));
    }
  }
  return result;
}

/**
 * Returns true if candidateId is nested inside ancestorId.
 * Used to prevent circular moves (moving a folder into its own descendant).
 */
export function isDescendantOf(
  items: FileTreeItem[],
  candidateId: string,
  ancestorId: string
): boolean {
  const ancestor = findItemById(items, ancestorId);
  if (!ancestor || !ancestor.children) return false;
  for (const child of ancestor.children) {
    if (child.id === candidateId) return true;
    if (child.children && isDescendantOf([child], candidateId, child.id)) {
      return true;
    }
  }
  return false;
}

/**
 * Slugify a name for URL usage
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.mmd$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Get the path from root to a specific item
 * Returns array of items from root to target (inclusive)
 */
export function getPathToItem(
  items: FileTreeItem[],
  targetId: string
): FileTreeItem[] {
  function search(
    nodes: FileTreeItem[],
    path: FileTreeItem[]
  ): FileTreeItem[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node];
      if (node.id === targetId) {
        return currentPath;
      }
      if (node.children) {
        const result = search(node.children, currentPath);
        if (result) return result;
      }
    }
    return null;
  }
  return search(items, []) || [];
}

/**
 * Find an item by its URL slug path
 * Returns the item if found, null otherwise
 */
export function findItemByPath(
  items: FileTreeItem[],
  slugPath: string[]
): FileTreeItem | null {
  if (slugPath.length === 0) return null;

  function search(
    nodes: FileTreeItem[],
    remainingPath: string[]
  ): FileTreeItem | null {
    if (remainingPath.length === 0) return null;

    const [currentSlug, ...rest] = remainingPath;

    for (const node of nodes) {
      if (slugify(node.name) === currentSlug) {
        // If this is the last segment, return the node
        if (rest.length === 0) {
          return node;
        }
        // Otherwise, continue searching in children
        if (node.children) {
          return search(node.children, rest);
        }
        return null;
      }
    }
    return null;
  }

  return search(items, slugPath);
}

/**
 * Get the URL path for an item
 */
export function getItemUrlPath(
  items: FileTreeItem[],
  itemId: string
): string | null {
  const path = getPathToItem(items, itemId);
  if (path.length === 0) return null;
  return "/files/" + path.map((item) => slugify(item.name)).join("/");
}

/**
 * Find an item by ID in the tree
 */
export function findItemById(
  items: FileTreeItem[],
  id: string
): FileTreeItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all parent IDs for an item (for expanding folders to reveal a file)
 */
export function getParentIds(
  items: FileTreeItem[],
  itemId: string
): string[] {
  const path = getPathToItem(items, itemId);
  // Return all but the last item (the item itself)
  return path.slice(0, -1).map((item) => item.id);
}

/**
 * Generate a unique "copy" name given the original name and a list of sibling names.
 * Mirrors the server-side logic in features/items/api.ts.
 */
export function generateCopyName(
  originalName: string,
  siblingNames: string[],
): string {
  const stem = originalName.replace(/\.mmd$/, "");
  const nameSet = new Set(siblingNames);
  let copyName = `${stem} copy.mmd`;
  let counter = 2;
  while (nameSet.has(copyName)) {
    copyName = `${stem} copy ${counter}.mmd`;
    counter++;
  }
  return copyName;
}

/**
 * Build a nested tree from a flat list of DB rows.
 * Rows should be sorted: folders first, then alphabetical by name.
 */
export function buildTreeFromFlatList(
  rows: { id: string; parentId: string | null; name: string; isFolder: boolean }[]
): FileTreeItem[] {
  const map = new Map<string, FileTreeItem>();
  const roots: FileTreeItem[] = [];

  // First pass: create all nodes
  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.isFolder ? "folder" : "file",
      parentId: row.parentId,
      ...(row.isFolder ? { children: [] } : {}),
    });
  }

  // Second pass: link children to parents
  for (const row of rows) {
    const node = map.get(row.id)!;
    if (row.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(row.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        // Orphaned node — treat as root
        roots.push(node);
      }
    }
  }

  return roots;
}
