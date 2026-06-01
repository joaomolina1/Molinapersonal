"use client";

import { ErrorBoundary } from "@/_services/sentry";
import HomeLogos from "../HomeLogos";

const Partners = () => {
  return (
    <ErrorBoundary>
      <HomeLogos
        label="Alguns dos nossos parceiros"
        logos={LOGOS.map((logo) => ({
          src: `/partner-logos/${logo.name}.webp`,
          width: logo.width,
        }))}
      />
    </ErrorBoundary>
  );
};

const LOGOS = [
  {
    name: "almeida-hotels",
    width: 31,
  },
  {
    name: "casa-do-marques",
    width: 45,
  },
  {
    name: "casa-da-comida",
    width: 40,
  },
  {
    name: "crc-hotels",
    width: 78,
  },
  {
    name: "details-hotels",
    width: 80,
  },
  {
    name: "editory-hotels",
    width: 47,
  },
  {
    name: "grupo-hf",
    width: 40,
  },
  {
    name: "hard-rock-cafe",
    width: 68,
  },
  {
    name: "m-catering",
    width: 40,
  },
  {
    name: "maleo-spaces",
    width: 40,
  },
  {
    name: "minor-hotels",
    width: 80,
  },
  {
    name: "paradigma-restaurantes",
    width: 113,
  },
  {
    name: "pasta-non-basta",
    width: 44,
  },
  {
    name: "pitaya",
    width: 80,
  },
  {
    name: "prime-catering",
    width: 80,
  },
  {
    name: "sana-hotels",
    width: 193,
  },
  {
    name: "sitio-coworking",
    width: 80,
  },
  {
    name: "stay-upon-hospitality",
    width: 40,
  },
  {
    name: "suspeitos-do-costume",
    width: 40,
  },
  {
    name: "tutto-passa",
    width: 40,
  },
  {
    name: "wotels",
    width: 80,
  },
];

export default Partners;
