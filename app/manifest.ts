import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RINU",
    short_name: "RINU",
    description: "O seu evento num só clique",
    id: "/",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    icons: [
      {
        src: "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  };
}

// https://github.com/vercel/next.js/discussions/72221
export const dynamic = "force-static";
