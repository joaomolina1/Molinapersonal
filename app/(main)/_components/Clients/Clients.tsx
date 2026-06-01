import { ErrorBoundary } from "@/_services/sentry";
import HomeLogos from "../HomeLogos";

const Clients = () => {
  return (
    <ErrorBoundary>
      <HomeLogos
        label="Empresas que já confiaram em nós"
        logos={LOGOS.map((logo) => ({
          src: `/client-logos/${logo.name}.webp`,
          width: logo.width,
        }))}
      />
    </ErrorBoundary>
  );
};

const LOGOS = [
  {
    name: "accenture",
    width: 136,
  },
  {
    name: "calvelex",
    width: 115,
  },
  {
    name: "grit",
    width: 158,
  },
  {
    name: "nutrium",
    width: 142,
  },
  {
    name: "poke-house",
    width: 47,
  },
  {
    name: "rumos",
    width: 112,
  },
  {
    name: "yunit",
    width: 80,
  },
];

export default Clients;
