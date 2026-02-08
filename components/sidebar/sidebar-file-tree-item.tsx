"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconChevronRight, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { MermaidIcon } from "@/components/icons/mermaid-icon";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { FileTreeContextMenu, FileTreeItemActions } from "./file-tree-context-menu";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { useFileTreeDnd } from "@/hooks/use-file-tree-dnd";
import { getItemUrlPath } from "@/lib/file-tree-utils";
import { cn } from "@/lib/utils";
import { useSettingsQuery } from "@/features/settings/query";
import type { FileTreeItem } from "@/lib/types";

// Compact styling overrides — VS Code / Notion-like flat rows
const compactButton = "h-7 !rounded-[3px] px-2 gap-1.5";
const compactSubButton = "h-7 !rounded-[3px] px-1.5 gap-1.5";
// Reduce sub-menu right margin so highlights extend closer to the edge
const compactSubMenu = "!mr-0.5 !pr-1";

interface SidebarFileTreeItemProps {
  item: FileTreeItem;
  level?: number;
}

function RenameInput({
  item,
  isCreating,
  onFinish,
  onCancel,
}: {
  item: FileTreeItem;
  isCreating?: boolean;
  onFinish: (name: string) => void;
  onCancel: () => void;
}) {
  const isFile = item.type === "file";
  const stem = isFile ? item.name.replace(/\.mmd$/, "") : item.name;
  const [value, setValue] = React.useState(stem);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    const fullName = isFile ? `${trimmed}.mmd` : trimmed;
    if (fullName !== item.name) {
      onFinish(fullName);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isCreating) {
        const trimmed = value.trim();
        if (!trimmed) {
          onCancel();
          return;
        }
        const fullName = isFile ? `${trimmed}.mmd` : trimmed;
        onFinish(fullName);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (isCreating) {
      onCancel();
    } else {
      handleSubmit();
    }
  };

  return (
    <span className="flex flex-1 items-baseline min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none border-b border-sidebar-ring px-1"
        onClick={(e) => e.stopPropagation()}
      />
      {isFile && (
        <span className="text-sm text-muted-foreground shrink-0">.mmd</span>
      )}
    </span>
  );
}

function DraggableWrapper({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const isDndEnabled = useFileTreeDnd((s) => s.isDndEnabled);
  const isCreating = useFileTreeStore((s) => s.creatingIds.has(id));
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: !isDndEnabled || isCreating,
  });

  if (!isDndEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(className, isDragging && "opacity-50")}
    >
      {children}
    </div>
  );
}

function DroppableWrapper({
  id,
  children,
  isFolder,
}: {
  id: string;
  children: React.ReactNode;
  isFolder: boolean;
}) {
  const activeId = useFileTreeDnd((s) => s.activeId);
  const isDndEnabled = useFileTreeDnd((s) => s.isDndEnabled);
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !isDndEnabled,
  });

  const showDropIndicator = isOver && activeId && activeId !== id;

  if (!isDndEnabled) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative",
        showDropIndicator && isFolder && "ring-2 ring-sidebar-primary ring-inset rounded-[3px]",
        showDropIndicator && !isFolder && "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-sidebar-primary"
      )}
    >
      {children}
    </div>
  );
}

export function SidebarFileTreeItem({ item, level = 0 }: SidebarFileTreeItemProps) {
  // Granular selectors — only re-render when this item's state changes
  const expanded = useFileTreeStore((s) => s.expandedIds.has(item.id));
  const selected = useFileTreeStore((s) => s.selectedIds.has(item.id));
  const renaming = useFileTreeStore((s) => s.renamingId === item.id);
  const isCreating = useFileTreeStore((s) => s.creatingIds.has(item.id));
  const items = useFileTreeStore((s) => s.items);

  // Actions are stable references — subscribing doesn't cause re-renders
  const toggleExpanded = useFileTreeStore((s) => s.toggleExpanded);
  const handleItemClick = useFileTreeStore((s) => s.handleItemClick);
  const finishRenaming = useFileTreeStore((s) => s.finishRenaming);
  const cancelRenaming = useFileTreeStore((s) => s.cancelRenaming);
  const confirmCreate = useFileTreeStore((s) => s.confirmCreate);
  const abortCreate = useFileTreeStore((s) => s.abortCreate);

  const activeId = useFileTreeDnd((s) => s.activeId);
  const isDraggedInMulti = useFileTreeDnd((s) => s.draggedIds.has(item.id));
  const { data: settings } = useSettingsQuery();
  const showExtensions = settings?.showFileExtensions ?? false;

  const router = useRouter();
  const isFolder = item.type === "folder";
  const displayName =
    isFolder || showExtensions
      ? item.name
      : item.name.replace(/\.mmd$/, "");
  const hasChildren = isFolder && item.children && item.children.length > 0;
  const isDragging = activeId === item.id;
  const showDragOpacity = isDragging || isDraggedInMulti;

  const handleRenameFinish = (newName: string) => {
    if (isCreating) {
      confirmCreate(item.id, newName);
    } else if (newName !== item.name) {
      finishRenaming(item.id, newName);
    } else {
      cancelRenaming();
    }
  };

  const handleRenameCancel = () => {
    if (isCreating) {
      abortCreate(item.id);
    } else {
      cancelRenaming();
    }
  };

  const handleFileClick = (e: React.MouseEvent) => {
    const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey;
    handleItemClick(item.id, { metaKey: e.metaKey || e.ctrlKey, shiftKey: e.shiftKey });
    if (!hasModifier) {
      const urlPath = getItemUrlPath(items, item.id);
      if (urlPath) {
        router.push(urlPath);
      }
    }
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey;
    handleItemClick(item.id, { metaKey: e.metaKey || e.ctrlKey, shiftKey: e.shiftKey });
    if (!hasModifier) {
      toggleExpanded(item.id);
    }
  };

  // Root level items (level 0)
  if (level === 0) {
    if (isFolder) {
      return (
        <Collapsible open={expanded}>
          <SidebarMenuItem>
            <DroppableWrapper id={item.id} isFolder>
              <DraggableWrapper id={item.id} className={cn(showDragOpacity && "opacity-50")}>
                <FileTreeContextMenu item={item}>
                  <SidebarMenuButton
                    isActive={selected}
                    className={cn("group/folder", compactButton)}
                    onClick={handleFolderClick}
                  >
                    <IconChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200",
                        expanded && "rotate-90"
                      )}
                    />
                    <>{expanded ? <IconFolderOpen className="size-4 shrink-0" /> : <IconFolder className="size-4 shrink-0" />}</>
                    {renaming ? (
                      <RenameInput item={item} isCreating={isCreating} onFinish={handleRenameFinish} onCancel={handleRenameCancel} />
                    ) : (
                      <span className="truncate">{displayName}</span>
                    )}
                  </SidebarMenuButton>
                </FileTreeContextMenu>
              </DraggableWrapper>
            </DroppableWrapper>
            <FileTreeItemActions item={item} />
          </SidebarMenuItem>
          {hasChildren && (
            <CollapsibleContent>
              <SidebarMenuSub className={compactSubMenu}>
                {item.children!.map((child) => (
                  <SidebarFileTreeItem key={child.id} item={child} level={level + 1} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    // Root level file
    return (
      <SidebarMenuItem>
        <DroppableWrapper id={item.id} isFolder={false}>
          <DraggableWrapper id={item.id} className={cn(showDragOpacity && "opacity-50")}>
            <FileTreeContextMenu item={item}>
              <SidebarMenuButton
                isActive={selected}
                onClick={handleFileClick}
                className={compactButton}
              >
                <MermaidIcon className="size-4 shrink-0" />
                {renaming ? (
                  <RenameInput item={item} isCreating={isCreating} onFinish={handleRenameFinish} onCancel={handleRenameCancel} />
                ) : (
                  <span className="truncate">{displayName}</span>
                )}
              </SidebarMenuButton>
            </FileTreeContextMenu>
          </DraggableWrapper>
        </DroppableWrapper>
        <FileTreeItemActions item={item} />
      </SidebarMenuItem>
    );
  }

  // Nested items (level > 0)
  if (isFolder) {
    return (
      <Collapsible open={expanded}>
        <SidebarMenuSubItem>
          <DroppableWrapper id={item.id} isFolder>
            <DraggableWrapper id={item.id} className={cn(showDragOpacity && "opacity-50")}>
              <FileTreeContextMenu item={item}>
                <SidebarMenuSubButton
                  isActive={selected}
                  className={cn("group/folder", compactSubButton)}
                  onClick={handleFolderClick}
                >
                  <IconChevronRight
                    className={cn(
                      "size-3.5 shrink-0 transition-transform duration-200",
                      expanded && "rotate-90"
                    )}
                  />
                  <>{expanded ? <IconFolderOpen className="size-3.5 shrink-0" /> : <IconFolder className="size-3.5 shrink-0" />}</>
                  {renaming ? (
                    <RenameInput item={item} isCreating={isCreating} onFinish={handleRenameFinish} onCancel={handleRenameCancel} />
                  ) : (
                    <span className="truncate">{displayName}</span>
                  )}
                </SidebarMenuSubButton>
              </FileTreeContextMenu>
            </DraggableWrapper>
          </DroppableWrapper>
          <FileTreeItemActions item={item} isSubItem />
        </SidebarMenuSubItem>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub className={compactSubMenu}>
              {item.children!.map((child) => (
                <SidebarFileTreeItem key={child.id} item={child} level={level + 1} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  // Nested file
  return (
    <SidebarMenuSubItem>
      <DroppableWrapper id={item.id} isFolder={false}>
        <DraggableWrapper id={item.id} className={cn(showDragOpacity && "opacity-50")}>
          <FileTreeContextMenu item={item}>
            <SidebarMenuSubButton
              isActive={selected}
              onClick={handleFileClick}
              className={compactSubButton}
            >
              <MermaidIcon className="size-3.5 shrink-0" />
              {renaming ? (
                <RenameInput item={item} isCreating={isCreating} onFinish={handleRenameFinish} onCancel={handleRenameCancel} />
              ) : (
                <span className="truncate">{displayName}</span>
              )}
            </SidebarMenuSubButton>
          </FileTreeContextMenu>
        </DraggableWrapper>
      </DroppableWrapper>
      <FileTreeItemActions item={item} isSubItem />
    </SidebarMenuSubItem>
  );
}
