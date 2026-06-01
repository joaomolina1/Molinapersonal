import { ButtonProps } from "@/_design_system/Button";
import { ReactNode } from "react";

export const BANNER_TYPES = {
  "christmas-party": {
    text: (
      <>
        A preparar
        <br /> o seu evento
        <br /> de Natal?
      </>
    ),
    theme: {
      textColor: "white",
      buttonType: "dark",
    },
    photo: "matilde.webp",
  },
  birthday: {
    text: (
      <>
        Encontre um
        <br /> espaço para a sua
        <br /> festa de anos
      </>
    ),
    theme: {
      textColor: "dark",
      buttonType: "dark",
    },
    photo: "matilde.webp",
  },
  "children-birthday": {
    text: (
      <>
        Espaço para festa de
        <br /> anos de crianças?
        <br /> Nós temos
      </>
    ),
    theme: {
      textColor: "white",
      buttonType: "dark",
    },
    photo: "luisa.webp",
  },
  "corporate-event": {
    text: (
      <>
        A sua empresa
        <br /> está a organizar
        <br /> um evento?
      </>
    ),
    theme: {
      textColor: "white",
      buttonType: "dark",
    },
    photo: "luisa.webp",
  },
} satisfies Record<
  string,
  {
    text: ReactNode;
    theme: {
      textColor: "white" | "dark";
      buttonType: ButtonProps["type"];
    };
    photo: string;
  }
>;

export type BannerType = keyof typeof BANNER_TYPES;
