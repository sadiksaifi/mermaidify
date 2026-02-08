"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconFile, IconFilePlus, IconFolderPlus } from "@tabler/icons-react";

import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useFileTreeStore } from "@/contexts/file-tree-context";
import { useCreateFromTemplate } from "@/hooks/use-create-from-template";
import { getItemUrlPath, getPathToItem } from "@/lib/file-tree-utils";
import { DIAGRAM_TEMPLATES } from "@/lib/templates";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const rows = useFileTreeStore((s) => s._rows);
  const items = useFileTreeStore((s) => s.items);
  const createFolder = useFileTreeStore((s) => s.createFolder);

  const { createFromTemplate } = useCreateFromTemplate();
  const blankTemplate = DIAGRAM_TEMPLATES.find((t) => t.id === "blank")!;

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Custom event from sidebar search button
  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    document.addEventListener("open-command-palette", handleOpen);
    return () =>
      document.removeEventListener("open-command-palette", handleOpen);
  }, []);

  // Filter to files only
  const files = useMemo(() => {
    if (!rows) return [];
    return rows.filter((row) => !row.isFolder);
  }, [rows]);

  function handleSelectFile(fileId: string) {
    const url = getItemUrlPath(items, fileId);
    if (url) {
      router.push(url);
    }
    setOpen(false);
  }

  function handleNewFile() {
    createFromTemplate(blankTemplate);
    setOpen(false);
  }

  function handleNewFolder() {
    createFolder(null);
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search files..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {files.length > 0 && (
            <CommandGroup heading="Files">
              {files.map((file) => {
                const path = getPathToItem(items, file.id);
                const breadcrumb =
                  path.length > 1
                    ? path
                        .slice(0, -1)
                        .map((p) => p.name)
                        .join(" / ")
                    : null;

                return (
                  <CommandItem
                    key={file.id}
                    value={file.name}
                    onSelect={() => handleSelectFile(file.id)}
                  >
                    <IconFile className="text-muted-foreground" />
                    <span>{file.name}</span>
                    {breadcrumb && (
                      <span className="ml-auto text-xs text-muted-foreground truncate max-w-48">
                        {breadcrumb}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleNewFile}>
              <IconFilePlus className="text-muted-foreground" />
              <span>New File</span>
            </CommandItem>
            <CommandItem onSelect={handleNewFolder}>
              <IconFolderPlus className="text-muted-foreground" />
              <span>New Folder</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
