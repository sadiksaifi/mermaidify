"use client";

import {
  Sidebar,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarHeaderSection } from "./sidebar-header";
import { SidebarFileTree } from "./sidebar-file-tree";
import { SidebarFooterSection } from "./sidebar-footer";

type UserData = {
  name: string;
  email: string;
  avatar: string;
} | null;

export function AppSidebar({ user }: { user: UserData }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderSection />
      <SidebarFileTree />
      <SidebarFooterSection user={user} />
      <SidebarRail />
    </Sidebar>
  );
}
