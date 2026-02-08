"use client";

import Link from "next/link";
import { IconHome, IconSearch, IconInbox } from "@tabler/icons-react";

import {
  SidebarHeader as SidebarHeaderPrimitive,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Kbd } from "@/components/ui/kbd";

export function SidebarHeaderSection() {
  return (
    <SidebarHeaderPrimitive>
      <SidebarMenu>
        {/* Brand / Logo */}
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" render={<Link href="/" />} className="hover:bg-transparent active:bg-transparent">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="text-sm font-bold">M</span>
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">Mermaid Viewer</span>
              <span className="truncate text-xs text-muted-foreground">Workspace</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Home */}
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link href="/" />} tooltip="Home">
            <IconHome />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Search */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Search"
            onClick={() =>
              document.dispatchEvent(new Event("open-command-palette"))
            }
          >
            <IconSearch />
            <span>Search</span>
            <Kbd className="ml-auto">
              <span className="text-[10px]">&#8984;</span>K
            </Kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Inbox */}
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link href="/inbox" />} tooltip="Inbox">
            <IconInbox />
            <span>Inbox</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderPrimitive>
  );
}
