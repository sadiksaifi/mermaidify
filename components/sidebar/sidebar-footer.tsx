"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  Logout01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

import {
  SidebarFooter as SidebarFooterPrimitive,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

export function SidebarFooterSection() {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  };

  return (
    <SidebarFooterPrimitive>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                >
                  <Avatar size="sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    strokeWidth={2}
                    className="ml-auto size-4"
                  />
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent
              className="w-56"
              side="top"
              align="end"
              sideOffset={4}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
                <Avatar size="sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm">Theme</span>
                <ModeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooterPrimitive>
  );
}
