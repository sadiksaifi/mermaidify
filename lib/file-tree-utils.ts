import type { FileTreeItem } from "./mock-file-tree";

/**
 * Slugify a name for URL usage
 * - Lowercase
 * - Spaces to hyphens
 * - Remove .md extension
 * - Remove special characters
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.md$/, "")
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
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
