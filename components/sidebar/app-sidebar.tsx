"use client";

import {
  Sidebar,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarHeaderSection } from "./sidebar-header";
import { SidebarFileTree } from "./sidebar-file-tree";
import { SidebarFooterSection } from "./sidebar-footer";
import { useAuth } from "@/features/auth/query";

export function AppSidebar() {
  const { data: user } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeaderSection />
      <SidebarFileTree />
      <SidebarFooterSection user={user ?? null} />
      <SidebarRail />
    </Sidebar>
  );
}
