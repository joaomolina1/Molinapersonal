import { useCallback, useEffect, useRef } from "react";

export const useScrollIntoView = <T extends HTMLElement>(
  scrollOnFirstRender?: boolean,
) => {
  const ref = useRef<T>(null);

  const scrollIntoView = useCallback(
    (options: ScrollIntoViewOptions = {}) => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        ...options,
      });
    },
    [ref],
  );

  useEffect(() => {
    if (scrollOnFirstRender) {
      scrollIntoView();
    }
  }, [scrollIntoView, scrollOnFirstRender]);

  return [ref, scrollIntoView] as const;
};
