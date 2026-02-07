"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchMe } from "./http";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const meQueryOptions = queryOptions({
  queryKey: authKeys.me(),
  queryFn: fetchMe,
});

export function useAuth() {
  return useQuery(meQueryOptions);
}
