import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { duplicateItem } from "@/features/items/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;
  const { itemId } = await params;

  try {
    const newItem = await duplicateItem(user.id, itemId);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    const status = message === "Item not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
