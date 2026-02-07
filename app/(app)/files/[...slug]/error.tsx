"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function FileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </header>
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center gap-4 text-center pt-12">
          <h2 className="text-xl font-semibold">Failed to load file</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message || "An unexpected error occurred."}
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </>
  );
}
