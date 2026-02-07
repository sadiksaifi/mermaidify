"use client";

import { use } from "react";
import { useFileTreeContext } from "@/contexts/file-tree-context";
import { findItemByPath, getPathToItem } from "@/lib/file-tree-utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { FilePageClient } from "./file-page-client";

interface FilePageProps {
  params: Promise<{ slug: string[] }>;
}

export default function FilePage({ params }: FilePageProps) {
  const { slug } = use(params);
  const { items, isLoading } = useFileTreeContext();

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </header>
        <div className="flex-1 p-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
      </>
    );
  }

  const item = findItemByPath(items, slug);

  if (!item || item.type === "folder") {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Not Found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-4">File not found</h1>
          <p className="text-muted-foreground">
            The file you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </>
    );
  }

  const pathItems = getPathToItem(items, item.id);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathItems.map((pathItem, index) => (
              <span key={pathItem.id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === pathItems.length - 1 ? (
                    <BreadcrumbPage>{pathItem.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#">{pathItem.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 p-6">
        <FilePageClient itemId={item.id} itemName={item.name} />
      </div>
    </>
  );
}
