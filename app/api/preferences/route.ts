import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/features/settings/constants";
import type { AppSettings } from "@/features/settings/types";

export async function GET() {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;

  const row = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .then((rows) => rows[0]);

  const stored = (row?.preferences ?? {}) as Partial<AppSettings>;
  const merged: AppSettings = { ...DEFAULT_SETTINGS, ...stored };

  return NextResponse.json(merged);
}

export async function PATCH(request: Request) {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return errorResponse;

  const updates = (await request.json()) as Partial<AppSettings>;

  // Get existing preferences
  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .then((rows) => rows[0]);

  const stored = (existing?.preferences ?? {}) as Partial<AppSettings>;
  const merged = { ...stored, ...updates };

  // Upsert
  await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      preferences: merged,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        preferences: merged,
        updatedAt: new Date(),
      },
    });

  const full: AppSettings = { ...DEFAULT_SETTINGS, ...merged };
  return NextResponse.json(full);
}
