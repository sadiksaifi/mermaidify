import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import {
  buildTreeFromFlatList,
  findItemByPath,
  getPathToItem,
} from "@/lib/file-tree-utils";
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

export default async function FilePage({ params }: FilePageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch user's file tree from DB
  const rows = await db
    .select({
      id: items.id,
      parentId: items.parentId,
      name: items.name,
      isFolder: items.isFolder,
    })
    .from(items)
    .where(eq(items.userId, user.id))
    .orderBy(desc(items.isFolder), asc(items.name));

  const tree = buildTreeFromFlatList(rows);

  // Find the item by the URL path
  const item = findItemByPath(tree, slug);

  // If not found or if it's a folder, return 404
  if (!item || item.type === "folder") {
    notFound();
  }

  // Get the breadcrumb path
  const pathItems = getPathToItem(tree, item.id);

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
