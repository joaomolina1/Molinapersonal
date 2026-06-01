"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/_services/api";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useRouterPush } from "./navigation";
import { getFetchApiForSession } from "./apiServer";
import { UserKind } from "@/_constants/space/userKinds";

// Auth Provider

export type Role = "customer" | "vendor" | "admin";

export type Session = {
  user_id: string;
  name: string;
  email: string;
  token: string;
  roles: Role[];
};

const fetchApi = getFetchApiForSession(undefined);

const sessionPromise = fetchApi<Session>("auth", "session", {
  credentials: "include",
}).catch((err: Error) => {
  if (!err.message.includes("401")) {
    console.error(err);
  }

  return null;
});

export const AuthContext = createContext<
  [
    Session | null | undefined,
    Dispatch<SetStateAction<Session | null | undefined>>,
  ]
>([undefined, () => {}]);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    sessionPromise.then(setSession);
  }, []);

  return <AuthContext value={[session, setSession]}>{children}</AuthContext>;
};

export const useSession = () => {
  const sessionState = useContext(AuthContext);

  return sessionState;
};

export const useLogout = () => {
  const fetchApi = useFetch();
  const routerPush = useRouterPush();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [, setSession] = useSession();

  return useMutation({
    mutationFn: () =>
      fetchApi(
        "auth",
        "logout",
        { method: "POST" },
        {
          tokenAuthenticated: true,
          cookieAuthenticated: false,
        },
      )
        .then(() => {
          setSession(null);
          queryClient.clear();
          if (
            pathname !== "/search" &&
            !pathname.startsWith("/space") &&
            pathname !== "/contacts" &&
            pathname !== "/help-host" &&
            pathname !== "/help-customer" &&
            pathname !== "/about-us" &&
            !pathname.startsWith("/event/")
          ) {
            routerPush("/");
          }
        })
        .catch((e: Error) => {
          if (e.message.includes("401")) {
            window.location.reload();
          } else {
            throw e;
          }
        }),
  });
};

export const useLogin = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();
  const [, setSession] = useSession();

  return useMutation<
    Session,
    unknown,
    { username: string; password: string },
    unknown
  >({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "login",
        { method: "POST", body },
        {
          contentType: "form",
          tokenAuthenticated: false,
          cookieAuthenticated: true,
        },
      ).then((session: Session) => {
        setSession(session);
        queryClient.invalidateQueries();

        return session;
      }),
  });
};

export const useRegister = () => {
  const fetchApi = useFetch();

  return useMutation<
    void,
    unknown,
    {
      name: string;
      username: string;
      password: string;
      code?: string;
      role: Role;
      kind: UserKind;
      month_of_birth?: string;
    },
    unknown
  >({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "register",
        { method: "POST", body },
        {
          contentType: "form",
          tokenAuthenticated: false,
          cookieAuthenticated: false,
        },
      ),
  });
};

export const useConfirmEmail = () => {
  const fetchApi = useFetch();

  return useMutation<void, unknown, { username: string; otp: string }, unknown>(
    {
      mutationFn: (body) =>
        fetchApi(
          "auth",
          "confirm",
          { method: "POST", body },
          {
            contentType: "form",
            tokenAuthenticated: false,
            cookieAuthenticated: false,
          },
        ),
    },
  );
};

export const useVerifyCode = () => {
  const fetchApi = useFetch();

  return useMutation<void, unknown, { code: string }, unknown>({
    mutationFn: ({ code }) =>
      fetchApi(
        "auth",
        `access?code=${code}`,
        { method: "GET" },
        {
          tokenAuthenticated: false,
          cookieAuthenticated: false,
        },
      ),
  });
};

export const useChangePassword = () => {
  const fetchApi = useFetch();
  const [, setSession] = useSession();

  return useMutation<Session, unknown, { old: string; new: string }, unknown>({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "change-password",
        { method: "POST", body },
        {
          contentType: "form-data",
          tokenAuthenticated: true,
          cookieAuthenticated: false,
        },
      ).then((session: Session) => {
        setSession(session);

        return session;
      }),
  });
};

export const useAdminResetPassword = () => {
  const fetchApi = useFetch();

  return useMutation<void, unknown, { user: string; new: string }, unknown>({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "reset-password",
        { method: "POST", body },
        {
          contentType: "form-data",
          tokenAuthenticated: true,
          cookieAuthenticated: false,
        },
      ),
  });
};

export const useResetPassword = () => {
  const fetchApi = useFetch();
  const [, setSession] = useSession();

  return useMutation<
    Session,
    unknown,
    { username: string; password: string; otp: string },
    unknown
  >({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "reset-password",
        { method: "POST", body },
        {
          contentType: "form",
          tokenAuthenticated: false,
          cookieAuthenticated: false,
        },
      ).then((session: Session) => {
        setSession(session);

        return session;
      }),
  });
};

export const useRequestResetPassword = () => {
  const fetchApi = useFetch();

  return useMutation<void, unknown, { username: string }, unknown>({
    mutationFn: (body) =>
      fetchApi(
        "auth",
        "request-reset-password",
        { method: "POST", body },
        {
          contentType: "form",
          tokenAuthenticated: false,
          cookieAuthenticated: false,
        },
      ),
  });
};
