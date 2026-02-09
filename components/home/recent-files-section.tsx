"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { IconFile, IconFileOff, IconSearch } from "@tabler/icons-react";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { getItemUrlPath } from "@/lib/file-tree-utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type SortMode = "modified" | "name";

export function RecentFilesSection() {
  const [sort, setSort] = useState<SortMode>("modified");
  const rows = useFileTreeStore((s) => s._rows);
  const items = useFileTreeStore((s) => s.items);
  const isLoading = useFileTreeStore((s) => s.isLoading);

  const files = useMemo(() => {
    if (!rows) return [];
    const fileRows = rows.filter((r) => !r.isFolder);
    if (sort === "modified") {
      return [...fileRows].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return [...fileRows].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, sort]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-4 h-7 w-48">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[156px] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-wrap-balance">
            Recent Diagrams
          </h2>
          <div className="flex gap-1 rounded-lg bg-muted p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSort("modified")}
              className={cn(
                "rounded-md px-2 py-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sort === "modified"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Last Modified
            </button>
            <button
              type="button"
              onClick={() => setSort("name")}
              className={cn(
                "rounded-md px-2 py-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sort === "name"
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Name
            </button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            document.dispatchEvent(new Event("open-command-palette"))
          }
        >
          <IconSearch className="size-3.5" />
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <IconFileOff
            className="size-10 text-muted-foreground/50"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            No diagrams yet. Create one from the templates above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => {
            const url = getItemUrlPath(items, file.id);
            if (!url) return null;

            return (
              <Link
                key={file.id}
                href={url}
                className={cn(
                  "group flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card transition-all",
                  "hover:border-primary/40 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                style={{ touchAction: "manipulation" }}
              >
                <div className="flex h-[100px] items-center justify-center bg-muted/50">
                  <IconFile
                    className="size-8 text-muted-foreground/60 transition-colors group-hover:text-primary/70"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 border-t px-3 py-2">
                  <p className="truncate text-sm font-medium">
                    {file.name.replace(/\.mmd$/, "")}
                  </p>
                  <p className="truncate text-xs tabular-nums text-muted-foreground">
                    {formatRelativeTime(file.updatedAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
