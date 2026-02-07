"use client";

import { useState, useCallback } from "react";

function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return defaultValue;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() =>
    getStoredValue(key, defaultValue),
  );

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          newValue instanceof Function ? newValue(prev) : newValue;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Ignore storage errors
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
