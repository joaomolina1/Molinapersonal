"use client";

import { TextButton } from "@/_design_system/Button";
import { createBEMClasses } from "@/_utils/classname";
import { useHostStatus } from "../Header/useHostStatus";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const { element } = createBEMClasses("footer");

export const FooterHostLink = () => {
  const pathname = usePathname();
  const hostStatus = useHostStatus();

  if (!hostStatus) {
    return null;
  }

  const handlePartnerFooterOptions = (text: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "footer_options",
      Rinu_eLabel1: text,
    });
  };

  return (
    <div className={element("map__others__section")}>
      <span className={element("map__others__section__title")}>Parceiro</span>
      <ul>
        <li>
          <TextButton
            href={hostStatus.href}
            text={
              hostStatus.isAlreadyHost
                ? "A minha oferta"
                : "Registe o seu espaço"
            }
            className={element("map__others__section__link")}
            onClick={() =>
              handlePartnerFooterOptions(
                hostStatus.isAlreadyHost
                  ? "A minha oferta"
                  : "Registe o seu espaço",
              )
            }
            prefetch={false}
          />
        </li>
        <li>
          <TextButton
            href="/help-host"
            text="Vantagens do parceiro"
            className={element("map__others__section__link")}
            onClick={() => handlePartnerFooterOptions("Vantagens do parceiro")}
          />
        </li>
        <li>
          <TextButton
            href="/subscription-plans"
            text="Planos de subscrição"
            className={element("map__others__section__link")}
            onClick={() => handlePartnerFooterOptions("Planos de subscrição")}
          />
        </li>
      </ul>
    </div>
  );
};
