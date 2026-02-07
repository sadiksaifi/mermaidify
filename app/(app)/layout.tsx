import { createClient } from "@/lib/supabase/server";
import { FileTreeProvider } from "@/contexts/file-tree-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userData = user
    ? {
        name: user.user_metadata?.full_name ?? user.email ?? "User",
        email: user.email ?? "",
        avatar: user.user_metadata?.avatar_url ?? "",
      }
    : null;

  return (
    <FileTreeProvider>
      <SidebarProvider>
        <AppSidebar user={userData} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </FileTreeProvider>
  );
}
