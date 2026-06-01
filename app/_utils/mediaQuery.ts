"use client";

import { useEffect, useState } from "react";

const breakpoints = {
  small: "36rem",
  medium: "48rem",
  large: "62rem",
  xLarge: "75rem",
};

export const useMediaQuery = (size: keyof typeof breakpoints) => {
  const [matches, setMatches] = useState<boolean>();

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoints[size]})`);

    if (matches !== mediaQuery.matches) {
      setMatches(mediaQuery.matches);
    }

    const eventListener = () => setMatches(mediaQuery.matches);

    window.addEventListener("resize", eventListener);

    return () => window.removeEventListener("resize", eventListener);
  }, [matches, size]);

  return matches;
};

export function useCheckIfTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0,
    );
  }, []);

  return isTouchDevice;
}
