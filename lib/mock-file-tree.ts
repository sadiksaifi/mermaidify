export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
  parentId: string | null;
}

export const mockFileTree: FileTreeItem[] = [
  {
    id: "1",
    name: "Getting Started",
    type: "folder",
    parentId: null,
    children: [
      {
        id: "1-1",
        name: "Quick Start Guide.md",
        type: "file",
        parentId: "1",
      },
      {
        id: "1-2",
        name: "Installation.md",
        type: "file",
        parentId: "1",
      },
      {
        id: "1-3",
        name: "Configuration.md",
        type: "file",
        parentId: "1",
      },
    ],
  },
  {
    id: "2",
    name: "Documents",
    type: "folder",
    parentId: null,
    children: [
      {
        id: "2-1",
        name: "Work",
        type: "folder",
        parentId: "2",
        children: [
          {
            id: "2-1-1",
            name: "Project Proposal.md",
            type: "file",
            parentId: "2-1",
          },
          {
            id: "2-1-2",
            name: "Meeting Notes.md",
            type: "file",
            parentId: "2-1",
          },
          {
            id: "2-1-3",
            name: "Q4 Report.md",
            type: "file",
            parentId: "2-1",
          },
        ],
      },
      {
        id: "2-2",
        name: "Personal",
        type: "folder",
        parentId: "2",
        children: [
          {
            id: "2-2-1",
            name: "Journal.md",
            type: "file",
            parentId: "2-2",
          },
          {
            id: "2-2-2",
            name: "Goals 2024.md",
            type: "file",
            parentId: "2-2",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Projects",
    type: "folder",
    parentId: null,
    children: [
      {
        id: "3-1",
        name: "Website Redesign",
        type: "folder",
        parentId: "3",
        children: [
          {
            id: "3-1-1",
            name: "Requirements.md",
            type: "file",
            parentId: "3-1",
          },
          {
            id: "3-1-2",
            name: "Design System.md",
            type: "file",
            parentId: "3-1",
          },
          {
            id: "3-1-3",
            name: "Timeline.md",
            type: "file",
            parentId: "3-1",
          },
        ],
      },
      {
        id: "3-2",
        name: "Mobile App.md",
        type: "file",
        parentId: "3",
      },
    ],
  },
  {
    id: "4",
    name: "Archive",
    type: "folder",
    parentId: null,
    children: [
      {
        id: "4-1",
        name: "Old Notes.md",
        type: "file",
        parentId: "4",
      },
    ],
  },
  {
    id: "5",
    name: "README.md",
    type: "file",
    parentId: null,
  },
  {
    id: "6",
    name: "Changelog.md",
    type: "file",
    parentId: null,
  },
];
