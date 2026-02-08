export interface FileTreeRow {
  id: string;
  parentId: string | null;
  name: string;
  isFolder: boolean;
  updatedAt: string;
}

export interface CreateItemInput {
  parentId: string | null;
  name: string;
  isFolder: boolean;
}

export interface RenameItemInput {
  newName: string;
}

export interface MoveItemInput {
  newParentId: string | null;
}

export interface SaveContentInput {
  content: string;
}

export interface FileContent {
  content: string;
}
