import { appFetch } from "@/lib/app-fetch";
import type { UserData } from "./types";

export const fetchMe = () => appFetch<UserData>("/api/auth/me");
