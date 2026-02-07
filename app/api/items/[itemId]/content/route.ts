import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getFileContent, saveFileContent } from "@/features/items/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;
  const { itemId } = await params;

  try {
    const content = await getFileContent(user.id, itemId);
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not found";
    const status = message === "Item not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;
  const { itemId } = await params;

  try {
    const body = await request.json();
    await saveFileContent(user.id, itemId, body);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    const status = message === "Item not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
