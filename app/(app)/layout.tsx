"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileTreeProvider } from "@/contexts/file-tree-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useAuth } from "@/features/auth/query";

function getSidebarWidthCookie(): number | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)sidebar_width=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useAuth();
  const defaultWidth = useMemo(() => getSidebarWidthCookie(), []);

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      router.push("/login");
    }
  }, [user, isLoading, isError, router]);

  if (isLoading) return null;
  if (!user) return null;

  return (
    <FileTreeProvider>
      <SidebarProvider defaultWidth={defaultWidth}>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </FileTreeProvider>
  );
}
