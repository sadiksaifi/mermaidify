import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { renameItem, deleteItem } from "@/features/items/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;
  const { itemId } = await params;

  try {
    const body = await request.json();
    await renameItem(user.id, itemId, body);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    const status = message === "Item not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;
  const { itemId } = await params;

  try {
    await deleteItem(user.id, itemId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
