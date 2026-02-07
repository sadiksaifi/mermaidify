"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileTreeProvider } from "@/contexts/file-tree-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useAuth } from "@/features/auth/query";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      router.push("/login");
    }
  }, [user, isLoading, isError, router]);

  if (isLoading) return null;
  if (!user) return null;

  return (
    <FileTreeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </FileTreeProvider>
  );
}
