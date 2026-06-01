"use client";

import { useEffect, useState } from "react";

export type LocalStorageState<T> = {
  value: T | null | undefined;
  setValue: (value: T) => void;
  deleteValue: () => void;
};

/**
 * The value is undefined during server rendering, when the localStorage is not available
 * The value is T | null during client rendering, when the localStorage is available
 */
export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
): LocalStorageState<T> {
  const [state, setState] = useState<T | null | undefined>(undefined);

  useEffect(() => {
    const value = window.localStorage.getItem(key);
    let parsedValue = initialValue;

    if (value) {
      try {
        parsedValue = JSON.parse(value) as T;
      } catch {
        parsedValue = initialValue;
        window.localStorage.removeItem(key);
      }
    }

    setState(parsedValue ?? null);
  }, [key, initialValue]);

  const setValue = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    setState(value);
  };

  const deleteValue = () => {
    window.localStorage.removeItem(key);
    setState(null);
  };

  return {
    value: state,
    setValue,
    deleteValue,
  };
}
