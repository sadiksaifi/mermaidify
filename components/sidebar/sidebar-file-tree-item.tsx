"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChevronRight, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { MermaidIcon } from "@/components/icons/mermaid-icon";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { FileTreeContextMenu } from "./file-tree-context-menu";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { useFileTreeDnd } from "@/hooks/use-file-tree-dnd";
import { getItemUrlPath } from "@/lib/file-tree-utils";
import { cn } from "@/lib/utils";
import type { FileTreeItem } from "@/lib/types";

interface SidebarFileTreeItemProps {
  item: FileTreeItem;
  level?: number;
}

function RenameInput({
  item,
  onFinish,
}: {
  item: FileTreeItem;
  onFinish: (name: string) => void;
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
    const fullName = isFile ? `${trimmed}.mmd` : trimmed;
    if (trimmed && fullName !== item.name) {
      onFinish(fullName);
    } else {
      onFinish(item.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onFinish(item.name);
    }
  };

  return (
    <span className="flex flex-1 items-baseline min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: !isDndEnabled,
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
        showDropIndicator && isFolder && "ring-2 ring-sidebar-primary ring-inset rounded-lg",
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
  const selected = useFileTreeStore((s) => s.selectedId === item.id);
  const renaming = useFileTreeStore((s) => s.renamingId === item.id);
  const items = useFileTreeStore((s) => s.items);

  // Actions are stable references — subscribing doesn't cause re-renders
  const toggleExpanded = useFileTreeStore((s) => s.toggleExpanded);
  const setSelectedId = useFileTreeStore((s) => s.setSelectedId);
  const finishRenaming = useFileTreeStore((s) => s.finishRenaming);
  const cancelRenaming = useFileTreeStore((s) => s.cancelRenaming);

  const activeId = useFileTreeDnd((s) => s.activeId);

  const router = useRouter();
  const isFolder = item.type === "folder";
  const hasChildren = isFolder && item.children && item.children.length > 0;
  const isDragging = activeId === item.id;

  const handleFinishRename = (newName: string) => {
    if (newName !== item.name) {
      finishRenaming(item.id, newName);
    } else {
      cancelRenaming();
    }
  };

  const handleFileClick = () => {
    setSelectedId(item.id);
    const urlPath = getItemUrlPath(items, item.id);
    if (urlPath) {
      router.push(urlPath);
    }
  };

  const handleFolderToggle = () => {
    setSelectedId(item.id);
    toggleExpanded(item.id);
  };

  // Root level items (level 0)
  if (level === 0) {
    if (isFolder) {
      return (
        <Collapsible open={expanded} onOpenChange={handleFolderToggle}>
          <SidebarMenuItem>
            <DroppableWrapper id={item.id} isFolder>
              <DraggableWrapper id={item.id} className={cn(isDragging && "opacity-50")}>
                <FileTreeContextMenu item={item}>
                  <CollapsibleTrigger
                    className="flex-1"
                    nativeButton={true}
                    render={
                      <SidebarMenuButton
                        isActive={selected}
                        className="group/folder"
                      />
                    }
                  >
                    <IconChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200",
                        expanded && "rotate-90"
                      )}
                    />
                    <>{expanded ? <IconFolderOpen className="size-4 shrink-0" /> : <IconFolder className="size-4 shrink-0" />}</>
                    {renaming ? (
                      <RenameInput item={item} onFinish={handleFinishRename} />
                    ) : (
                      <span className="truncate">{item.name}</span>
                    )}
                  </CollapsibleTrigger>
                </FileTreeContextMenu>
              </DraggableWrapper>
            </DroppableWrapper>
          </SidebarMenuItem>
          {hasChildren && (
            <CollapsibleContent>
              <SidebarMenuSub>
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
    const urlPath = getItemUrlPath(items, item.id);
    return (
      <SidebarMenuItem>
        <DroppableWrapper id={item.id} isFolder={false}>
          <DraggableWrapper id={item.id} className={cn(isDragging && "opacity-50")}>
            <FileTreeContextMenu item={item}>
              <SidebarMenuButton
                isActive={selected}
                render={urlPath ? <Link href={urlPath} /> : undefined}
                onClick={handleFileClick}
              >
                <MermaidIcon className="size-4 shrink-0" />
                {renaming ? (
                  <RenameInput item={item} onFinish={handleFinishRename} />
                ) : (
                  <span className="truncate">{item.name}</span>
                )}
              </SidebarMenuButton>
            </FileTreeContextMenu>
          </DraggableWrapper>
        </DroppableWrapper>
      </SidebarMenuItem>
    );
  }

  // Nested items (level > 0)
  if (isFolder) {
    return (
      <Collapsible open={expanded} onOpenChange={handleFolderToggle}>
        <SidebarMenuSubItem>
          <DroppableWrapper id={item.id} isFolder>
            <DraggableWrapper id={item.id} className={cn(isDragging && "opacity-50")}>
              <FileTreeContextMenu item={item}>
                <CollapsibleTrigger
                  className="flex-1"
                  nativeButton={false}
                  render={
                    <SidebarMenuSubButton
                      isActive={selected}
                      className="group/folder"
                    />
                  }
                >
                  <IconChevronRight
                    className={cn(
                      "size-3.5 shrink-0 transition-transform duration-200",
                      expanded && "rotate-90"
                    )}
                  />
                  <>{expanded ? <IconFolderOpen className="size-3.5 shrink-0" /> : <IconFolder className="size-3.5 shrink-0" />}</>
                  {renaming ? (
                    <RenameInput item={item} onFinish={handleFinishRename} />
                  ) : (
                    <span className="truncate">{item.name}</span>
                  )}
                </CollapsibleTrigger>
              </FileTreeContextMenu>
            </DraggableWrapper>
          </DroppableWrapper>
        </SidebarMenuSubItem>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
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
  const urlPath = getItemUrlPath(items, item.id);
  return (
    <SidebarMenuSubItem>
      <DroppableWrapper id={item.id} isFolder={false}>
        <DraggableWrapper id={item.id} className={cn(isDragging && "opacity-50")}>
          <FileTreeContextMenu item={item}>
            <SidebarMenuSubButton
              isActive={selected}
              render={urlPath ? <Link href={urlPath} /> : undefined}
              onClick={handleFileClick}
            >
              <MermaidIcon className="size-3.5 shrink-0" />
              {renaming ? (
                <RenameInput item={item} onFinish={handleFinishRename} />
              ) : (
                <span className="truncate">{item.name}</span>
              )}
            </SidebarMenuSubButton>
          </FileTreeContextMenu>
        </DraggableWrapper>
      </DroppableWrapper>
    </SidebarMenuSubItem>
  );
}
