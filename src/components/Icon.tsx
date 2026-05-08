import type { SVGProps } from "react";

type IconName =
  | "home"
  | "drop"
  | "bottle"
  | "history"
  | "stats"
  | "baby"
  | "logout"
  | "back"
  | "play"
  | "stop"
  | "check"
  | "plus"
  | "left"
  | "right"
  | "both"
  | "dash"
  | "save"
  | "sparkle"
  | "user"
  | "moon"
  | "sun"
  | "menu"
  | "close";

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  ),
  drop: (
    <path d="M12 3.5c-1.6 2-6 7.4-6 11.2a6 6 0 0 0 12 0c0-3.8-4.4-9.2-6-11.2Z" />
  ),
  bottle: (
    <>
      <path d="M9 3h6M10 3v3M14 3v3M8.5 8h7l-.6 11a3 3 0 0 1-3 2.8h-.4A3 3 0 0 1 8.4 19L7.8 8h.7Z" />
      <path d="M8.7 12.5h6.6" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
      <path d="M3.5 4v4h4" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  stats: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 9h.01M15 9h.01" />
      <path d="M9.5 12c.6.6 1.5 1 2.5 1s1.9-.4 2.5-1" />
      <path d="M5 21c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </>
  ),
  back: <path d="M15 6l-6 6 6 6" />,
  play: <path d="M8 5v14l11-7z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  check: <path d="M5 12.5 10 17 19 7" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  left: <path d="M14 5l-7 7 7 7" />,
  right: <path d="M10 5l7 7-7 7" />,
  both: (
    <>
      <path d="M7 8l-4 4 4 4" />
      <path d="M17 8l4 4-4 4" />
      <path d="M3 12h18" />
    </>
  ),
  dash: <path d="M6 12h12" />,
  save: (
    <>
      <path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M8 4v5h7V4" />
      <rect x="7" y="13" width="10" height="7" rx="1" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 16l.8 1.7 1.7.8-1.7.8L19 21l-.8-1.7-1.7-.8 1.7-.8.8-1.7z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  moon: <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6l-12 12" />,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
