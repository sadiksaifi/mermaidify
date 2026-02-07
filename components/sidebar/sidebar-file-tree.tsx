"use client";

import { IconPlus, IconFolder } from "@tabler/icons-react";
import { MermaidIcon } from "@/components/icons/mermaid-icon";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarFileTreeItem } from "./sidebar-file-tree-item";
import { useFileTree } from "@/hooks/use-file-tree";
import { FileTreeDndProvider } from "@/hooks/use-file-tree-dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarFileTree() {
  const { items, createFile, createFolder } = useFileTree();

  return (
    <SidebarContent>
      <ScrollArea className="h-full">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pr-1">
          <SidebarGroupLabel>
            Files
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarGroupAction>
                    <IconPlus />
                    <span className="sr-only">Add new</span>
                  </SidebarGroupAction>
                }
              />
              <DropdownMenuContent side="right" align="start" className="!rounded-md p-1">
                <DropdownMenuItem onClick={() => createFile(null)} className="!rounded-sm px-2 py-1.5 gap-2 text-xs">
                  <MermaidIcon />
                  <span>New File</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createFolder(null)} className="!rounded-sm px-2 py-1.5 gap-2 text-xs">
                  <IconFolder />
                  <span>New Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <FileTreeDndProvider>
              <SidebarMenu className="gap-0.5">
                {items.map((item) => (
                  <SidebarFileTreeItem key={item.id} item={item} />
                ))}
              </SidebarMenu>
            </FileTreeDndProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </ScrollArea>
    </SidebarContent>
  );
}
