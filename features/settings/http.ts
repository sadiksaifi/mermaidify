import { appFetch } from "@/lib/app-fetch";
import type { AppSettings } from "./types";

export const fetchPreferences = () =>
  appFetch<AppSettings>("/api/preferences");

export const updatePreferences = (updates: Partial<AppSettings>) =>
  appFetch<AppSettings>("/api/preferences", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
