import { useRouterPush, useRouterReplace } from "@/_services/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

export function useSearchParamsState<T extends string>(name: string) {
  const routerPush = useRouterPush();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = searchParams.get(name) as T | null;

  const getHref = (value: T | null) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    return pathname + "?" + params.toString();
  };

  const setState = (value: T | null) => {
    const href = getHref(value);

    routerPush(href, { scroll: false });
  };

  return [state, setState, getHref] as const;
}

export function useDebouncedSearchParamState<T extends string>(
  name: string,
  delay = 500,
) {
  const [debouncedState, setDebouncedState, getHref] =
    useSearchParamsState<T>(name);
  const [state, setState] = useState<T | null>(debouncedState);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const _setState = useCallback(
    (value: T | null, onUpdateDebouncedState?: () => void) => {
      setState(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setDebouncedState(value);
        onUpdateDebouncedState?.();
      }, delay);
    },
    [delay, setDebouncedState],
  );

  return [state, debouncedState, _setState, getHref] as const;
}

export function useSearchParamsArrayState<T extends string>(name: string) {
  const routerPush = useRouterPush();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = searchParams.getAll(name) as T[];

  const getHref = (values: T[]) => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    values.forEach((value) => params.append(name, value));

    return pathname + "?" + params.toString();
  };

  const setState = (values: T[]) => {
    const href = getHref(values);

    routerPush(href, { scroll: false });
  };

  return [state, setState, getHref] as const;
}

export function useSearchParamsObjectState<T extends string, U extends string>(
  keys: U[],
) {
  const routerPush = useRouterPush();
  const routerReplace = useRouterReplace();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = Object.fromEntries(
    keys.map((key) => [key, searchParams.get(key)]),
  ) as Record<U, T | null>;

  const getHref = (values: Record<U, T | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as T);
      } else {
        params.delete(key);
      }
    });

    return pathname + "?" + params.toString();
  };

  const setState = (
    values: Record<U, T | null>,
    mode: "push" | "replace" = "push",
  ) => {
    const href = getHref(values);

    if (mode === "push") {
      routerPush(href, { scroll: false });
    } else if (mode === "replace") {
      routerReplace(href, { scroll: false });
    }
  };

  return [state, setState, getHref] as const;
}
