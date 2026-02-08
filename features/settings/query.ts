"use client";

import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchPreferences, updatePreferences } from "./http";
import { DEFAULT_SETTINGS } from "./constants";
import type { AppSettings } from "./types";

export const settingsKeys = {
  all: ["settings"] as const,
};

export const settingsQueryOptions = queryOptions({
  queryKey: settingsKeys.all,
  queryFn: fetchPreferences,
  staleTime: Infinity,
  placeholderData: DEFAULT_SETTINGS,
});

export function useSettingsQuery() {
  return useQuery(settingsQueryOptions);
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<AppSettings>) => updatePreferences(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.all });
      const previous = queryClient.getQueryData<AppSettings>(settingsKeys.all);
      queryClient.setQueryData<AppSettings>(settingsKeys.all, (old) => ({
        ...(old ?? DEFAULT_SETTINGS),
        ...updates,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
