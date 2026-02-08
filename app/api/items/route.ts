import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { listItems, createItem, ensureDefaultFile } from "@/features/items/api";

export async function GET() {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;

  let rows = await listItems(user.id);

  if (rows.length === 0) {
    await ensureDefaultFile(user.id);
    rows = await listItems(user.id);
  }

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const newItem = await createItem(user.id, body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
