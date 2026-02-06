"use client";

import {
  Sidebar,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarHeaderSection } from "./sidebar-header";
import { SidebarFileTree } from "./sidebar-file-tree";
import { SidebarFooterSection } from "./sidebar-footer";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderSection />
      <SidebarFileTree />
      <SidebarFooterSection />
      <SidebarRail />
    </Sidebar>
  );
}
