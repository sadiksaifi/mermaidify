"use client";

import { DIAGRAM_TEMPLATES } from "@/lib/templates";
import { useCreateFromTemplate } from "@/hooks/use-create-from-template";
import { TemplateCard } from "./template-card";

export function TemplateStrip() {
  const { createFromTemplate, isPending } = useCreateFromTemplate();

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-wrap-balance">
        Start a New Diagram
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {DIAGRAM_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => createFromTemplate(template)}
            disabled={isPending}
          />
        ))}
      </div>
    </section>
  );
}
