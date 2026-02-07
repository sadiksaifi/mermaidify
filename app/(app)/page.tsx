"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 p-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Welcome to Mermaid Viewer</h1>
          <p className="text-muted-foreground mb-6">
            Select a file from the sidebar to view its contents. You can also
            create new files and folders, rename them, or delete them using the
            right-click context menu.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">File Navigation</h3>
              <p className="text-sm text-muted-foreground">
                Click on files to view them. Click on folders to expand or collapse them.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Context Menu</h3>
              <p className="text-sm text-muted-foreground">
                Right-click on any file or folder to rename, delete, or create new items.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted">Cmd+B</kbd> to toggle the sidebar.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Click your profile in the sidebar footer to toggle between light and dark themes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}