import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useDebouncedState = <T>(
  initialState: T,
  delay = 500,
): [T, T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(initialState);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedState(state), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, state]);

  return [state, debouncedState, setState];
};

export const debounce = <T extends () => void>(callback: T, delay: number) => {
  let timer: NodeJS.Timeout;

  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
};
