import type { User } from "@supabase/supabase-js";
import type { UserData } from "./types";

export function getMe(user: User): UserData {
  return {
    name: user.user_metadata?.full_name ?? user.email ?? "User",
    email: user.email ?? "",
    avatar: user.user_metadata?.avatar_url ?? "",
  };
}
