"use client";

import * as React from "react";
import type { MermaidConfig } from "mermaid";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { exportPng } from "@/lib/export-utils";

export interface ExportPngRequest {
  itemId: string;
  fileName: string;
  theme: MermaidConfig["theme"];
  look: MermaidConfig["look"];
}

interface ExportPngDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ExportPngRequest | null;
}

export function ExportPngDialog({
  open,
  onOpenChange,
  request,
}: ExportPngDialogProps) {
  const [background, setBackground] = React.useState<"transparent" | "white">(
    "white",
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setBackground("white");
      setIsSaving(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!request || isSaving) return;
    setIsSaving(true);
    try {
      await exportPng(request.itemId, request.fileName, request.theme, request.look, {
        background,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export PNG</DialogTitle>
          <DialogDescription>
            Choose whether to export with a white background or a transparent
            background. White background is selected by default.
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="PNG background style" className="grid gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={background === "white"}
            onClick={() => setBackground("white")}
            className={cn(
              "rounded-sm border px-3 py-2 text-left text-sm transition-colors",
              background === "white"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border hover:bg-muted/50 text-muted-foreground",
            )}
          >
            White Background (Default)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={background === "transparent"}
            onClick={() => setBackground("transparent")}
            className={cn(
              "rounded-sm border px-3 py-2 text-left text-sm transition-colors",
              background === "transparent"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border hover:bg-muted/50 text-muted-foreground",
            )}
          >
            Transparent
          </button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!request || isSaving}>
            {isSaving ? (
              <>
                <IconLoader2 className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
