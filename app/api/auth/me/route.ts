import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getMe } from "@/features/auth/api";

export async function GET() {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;

  return NextResponse.json(getMe(user));
}
