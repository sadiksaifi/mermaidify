import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { IconSettings } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <IconSettings className="size-12 text-muted-foreground/50" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Account and workspace settings will be available here soon.
        </p>
      </div>
    </>
  );
}
