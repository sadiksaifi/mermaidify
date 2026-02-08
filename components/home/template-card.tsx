"use client";

import {
  IconPlus,
  IconArrowsSplit,
  IconRelationManyToMany,
  IconMessages,
  IconHierarchy2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { DiagramTemplate } from "@/lib/templates";

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  blank: IconPlus,
  flowchart: IconArrowsSplit,
  "er-diagram": IconRelationManyToMany,
  sequence: IconMessages,
  "class-diagram": IconHierarchy2,
};

interface TemplateCardProps {
  template: DiagramTemplate;
  onClick: () => void;
  disabled?: boolean;
}

export function TemplateCard({ template, onClick, disabled }: TemplateCardProps) {
  const Icon = TEMPLATE_ICONS[template.id] ?? IconPlus;
  const isBlank = template.id === "blank";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border bg-card text-left transition-all",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isBlank && "border-dashed",
      )}
      style={{ touchAction: "manipulation" }}
    >
      <div className="flex h-[100px] items-center justify-center bg-muted/50">
        <Icon
          className={cn(
            "size-8 text-muted-foreground/60 transition-colors group-hover:text-primary/70",
            isBlank && "size-10",
          )}
          aria-hidden="true"
        />
      </div>
      <div className="border-t px-3 py-2">
        <p className="truncate text-sm font-medium">{template.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {template.description}
        </p>
      </div>
    </button>
  );
}
