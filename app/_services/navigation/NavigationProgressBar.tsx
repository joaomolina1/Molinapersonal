"use client";

// From: https://buildui.com/posts/global-progress-in-nextjs

import {
  ComponentProps,
  ReactNode,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  MouseEvent,
  useCallback,
  useMemo,
} from "react";
import {
  useSpring,
  motion,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import { createBEMClasses } from "@/_utils/classname";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Button from "@/_design_system/Button";

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      tick();

      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const useProgress = () => {
  const [state, setState] = useState<
    "initial" | "in-progress" | "completing" | "complete"
  >("initial");

  const value = useSpring(0, {
    damping: 25,
    mass: 0.5,
    stiffness: 300,
    restDelta: 0.1,
  });

  // During in-progress, increment the bar by little bits every 750ms
  useInterval(
    () => {
      // If we start progress but the bar is currently complete, reset it first.
      if (value.get() === 100) {
        value.jump(0);
      }

      const current = value.get();
      const diff = current === 0 ? 15 : current < 50 ? rand(1, 10) : rand(1, 5);

      value.set(Math.min(current + diff, 99));
    },
    state === "in-progress" ? 750 : null,
  );

  useEffect(() => {
    if (state === "initial") {
      value.jump(0);
    } else if (state === "completing") {
      value.set(100);
    }

    return value.on("change", (latest) => {
      if (latest === 100) {
        setState("complete");
      }
    });
  }, [state, value]);

  const reset = () => setState("initial");
  const start = () => setState("in-progress");
  const done = () =>
    setState((state) =>
      state === "initial" || state === "in-progress" ? "completing" : state,
    );

  return { state, value, start, done, reset };
};

const NavigationProgressBarContext = createContext<ReturnType<
  typeof useProgress
> | null>(null);

export const useNavigationProgressBar = () => {
  const progress = useContext(NavigationProgressBarContext);

  if (progress === null) {
    throw new Error("Can only be used within <NavigationProgressBarProvider>");
  }

  return progress;
};

const { block } = createBEMClasses("navigation-progress-bar");

export const NavigationProgressBarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const progress = useProgress();
  const width = useMotionTemplate`${progress.value}%`;

  return (
    <NavigationProgressBarContext value={progress}>
      <AnimatePresence onExitComplete={progress.reset}>
        {progress.state !== "complete" && (
          <motion.div
            style={{ width }}
            exit={{ opacity: 0 }}
            className={block()}
          />
        )}
      </AnimatePresence>
      {children}
    </NavigationProgressBarContext>
  );
};

type NavigationBlockerData = {
  content: ReactNode;
  yesLabel: ReactNode;
  yesAction?: () => void | Promise<void>;
  yesLoading?: boolean;
  noLabel: ReactNode;
};

const useNavigationBlockerState = () => {
  const [blockerData, setBlockerData] = useState<NavigationBlockerData | null>(
    null,
  );
  const [isLeavingPage, setIsLeavingPage] = useState(false);

  const confirmationFn = useRef<() => void | Promise<void>>(() => {});

  const value = useMemo(
    () => ({
      blockerData,
      setBlockerData,
      isLeavingPage,
      setIsLeavingPage,
      confirmationFn,
    }),
    [blockerData, isLeavingPage],
  );

  return value;
};

const NavigationBlockerContext = createContext<ReturnType<
  typeof useNavigationBlockerState
> | null>(null);

export const NavigationBlockerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigationBlocker = useNavigationBlockerState();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (navigationBlocker.blockerData) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigationBlocker.blockerData]);

  return (
    <NavigationBlockerContext value={navigationBlocker}>
      <Modal
        isOpen={navigationBlocker.isLeavingPage}
        onOpenChange={navigationBlocker.setIsLeavingPage}
        ariaLabel="Alerta de abandono de página"
        width="small"
        isDismissable={false}
        showCloseButton={false}
      >
        <Stack gap="2.5rem">
          <TextBlock subtitle={navigationBlocker.blockerData?.content} />
          <Stack gap="1rem">
            <Button
              label={navigationBlocker.blockerData?.yesLabel}
              type="red"
              onClick={async () => {
                await navigationBlocker.blockerData?.yesAction?.();
                await navigationBlocker.confirmationFn.current();
                navigationBlocker.setIsLeavingPage(false);
              }}
              loading={navigationBlocker.blockerData?.yesLoading}
            />
            <Button
              label={navigationBlocker.blockerData?.noLabel}
              type="secondary"
              onClick={() => {
                navigationBlocker.setIsLeavingPage(false);
              }}
            />
          </Stack>
        </Stack>
      </Modal>
      {children}
    </NavigationBlockerContext>
  );
};

export const useNavigationBlocker = () => {
  const navigationBlocker = useContext(NavigationBlockerContext);

  if (navigationBlocker === null) {
    throw new Error("Can only be used within <NavigationBlockerProvider>");
  }

  return navigationBlocker;
};

export type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

export const Link = (props: LinkProps) => {
  const router = useRouter();
  const navigationProgressBar = useNavigationProgressBar();
  const navigationBlocker = useNavigationBlocker();

  const { href, onClick, target } = props;

  const navigate = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      navigationProgressBar.start();
      onClick?.(e);

      startTransition(() => {
        navigationProgressBar.done();
        router.push(href);
      });
    },
    [href, navigationProgressBar, onClick, router],
  );

  if (target === "_blank") {
    return <NextLink {...props} />;
  }

  return (
    <NextLink
      {...props}
      onClick={(e) => {
        e.preventDefault();

        if (navigationBlocker.blockerData) {
          navigationBlocker.setIsLeavingPage(true);
          navigationBlocker.confirmationFn.current = () => navigate(e);
        } else {
          navigate(e);
        }
      }}
    />
  );
};

export const useRouterPush = () => {
  const router = useRouter();
  const navigationProgressBar = useNavigationProgressBar();
  const navigationBlocker = useNavigationBlocker();

  const navigate = useCallback(
    (...args: Parameters<AppRouterInstance["push"]>) => {
      navigationProgressBar.start();

      startTransition(() => {
        navigationProgressBar.done();
        router.push(...args);
      });
    },
    [navigationProgressBar, router],
  );

  return (...args: Parameters<AppRouterInstance["push"]>) => {
    if (navigationBlocker.blockerData) {
      navigationBlocker.setIsLeavingPage(true);
      navigationBlocker.confirmationFn.current = () => navigate(...args);
    } else {
      navigate(...args);
    }
  };
};

export const useRouterReplace = () => {
  const router = useRouter();
  const navigationProgressBar = useNavigationProgressBar();
  const navigationBlocker = useNavigationBlocker();

  const navigate = useCallback(
    (...args: Parameters<AppRouterInstance["replace"]>) => {
      navigationProgressBar.start();

      startTransition(() => {
        navigationProgressBar.done();
        router.replace(...args);
      });
    },
    [navigationProgressBar, router],
  );

  return (
    href: Parameters<AppRouterInstance["replace"]>[0],
    options?: Parameters<AppRouterInstance["replace"]>[1],
    skipBlocker?: boolean,
  ) => {
    if (navigationBlocker.blockerData && !skipBlocker) {
      navigationBlocker.setIsLeavingPage(true);
      navigationBlocker.confirmationFn.current = () => navigate(href, options);
    } else {
      navigate(href, options);
    }
  };
};
