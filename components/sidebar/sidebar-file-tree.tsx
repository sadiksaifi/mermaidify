"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

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
import { File01Icon, Folder01Icon } from "@hugeicons/core-free-icons";

export function SidebarFileTree() {
  const { items, createFile, createFolder } = useFileTree();

  return (
    <SidebarContent>
      <ScrollArea className="h-full">
        <SidebarGroup>
          <SidebarGroupLabel>
            Files
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarGroupAction>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                    <span className="sr-only">Add new</span>
                  </SidebarGroupAction>
                }
              />
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem onClick={() => createFile(null)}>
                  <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
                  <span>New File</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createFolder(null)}>
                  <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
                  <span>New Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <FileTreeDndProvider>
              <SidebarMenu>
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
