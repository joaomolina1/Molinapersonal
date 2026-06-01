import {
  SyntheticEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const useImageRatio = (imageKey?: number) => {
  const [containerRatio, setContainerRatio] = useState(0);
  const [imageRatio, setImageRatio] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerRatio(entry.contentRect.width / entry.contentRect.height);
        }
      });

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
  });

  const onLoadImage = useCallback(
    (event: SyntheticEvent<HTMLImageElement, Event>) => {
      setImageRatio(
        event.currentTarget.naturalWidth / event.currentTarget.naturalHeight,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageKey],
  );

  return { containerRatio, imageRatio, containerRef, onLoadImage };
};
