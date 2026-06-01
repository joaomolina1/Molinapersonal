"use client";

import { IconButton, TextButton } from "@/_design_system/Button";
import Logo from "@/_design_system/Logo";
import IconUserInterfaceSocialMediaFacebook from "@/_design_system/_icons/UserInterface/SocialMedia/Facebook.svg";
import IconUserInterfaceSocialMediaInstagram from "@/_design_system/_icons/UserInterface/SocialMedia/Instagram.svg";
import IconUserInterfaceSocialMediaLinkedin from "@/_design_system/_icons/UserInterface/SocialMedia/Linkedin.svg";
import { createBEMClasses } from "@/_utils/classname";
import { FooterHostLink } from "./FooterHostLink";
import { formatDate } from "@/_utils/date";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import Script from "next/script";
import { useEffect } from "react";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("footer");

const Footer = () => {
  const isMobile = useMediaQuery("large");
  const pathname = usePathname();
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const handleFooterOptions = (text: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "footer_options",
      Rinu_eLabel1: text,
    });
  };

  return (
    <ErrorBoundary>
      <footer className={block()}>
        <hr />
        <div className={element("map")}>
          <Logo link />
          <div className={element("map__others")}>
            <FooterHostLink />
            <div className={element("map__others__section")}>
              <span className={element("map__others__section__title")}>
                Conhecer a RINU
              </span>
              <ul>
                <li>
                  <TextButton
                    href="/about-us"
                    text="Sobre nós"
                    className={element("map__others__section__link")}
                    onClick={() => handleFooterOptions("Sobre nós")}
                  />
                </li>
                <li>
                  <TextButton
                    href="/blog"
                    text="Blog"
                    className={element("map__others__section__link")}
                    onClick={() => handleFooterOptions("Blog")}
                  />
                </li>
                <li>
                  <TextButton
                    href="/help-customer"
                    text="Como funciona"
                    className={element("map__others__section__link")}
                    onClick={() => handleFooterOptions("Como funciona")}
                  />
                </li>
                <li>
                  <TextButton
                    href={isMobile ? "/quote-request" : undefined}
                    text="Pedidos de orçamento"
                    className={element("map__others__section__link")}
                    onClick={() => {
                      handleFooterOptions("Pedidos de orçamento");
                      sendGAEvent("event", "Rinu_CustomClick", {
                        Rinu_ScreenName: pathname,
                        Rinu_ItemCategory: "enquire_request",
                        Rinu_ItemType: "footnote",
                      });

                      if (!isMobile) {
                        setQuoteRequestModalData({
                          isOpen: true,
                          context: { type: "quote-request" },
                        });
                      }
                    }}
                  />
                </li>
                <li>
                  <TextButton
                    href="/contacts"
                    text="Contactos"
                    className={element("map__others__section__link")}
                    onClick={() => handleFooterOptions("Contactos")}
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr />
        <div className={element("links")}>
          <div className={element("links__social")}>
            <IconButton
              icon={<IconUserInterfaceSocialMediaFacebook />}
              ariaLabel="Facebook"
              href="https://www.facebook.com/profile.php?id=61560507832398"
              target="_blank"
              onClick={() => handleFooterOptions("Facebook")}
            />
            <IconButton
              icon={<IconUserInterfaceSocialMediaInstagram />}
              ariaLabel="Instagram"
              href="https://www.instagram.com/rinu_pt/"
              target="_blank"
              onClick={() => handleFooterOptions("Instagram")}
            />
            <IconButton
              icon={<IconUserInterfaceSocialMediaLinkedin />}
              ariaLabel="Linkedin"
              href="https://www.linkedin.com/company/rinu_pt/"
              target="_blank"
              onClick={() => handleFooterOptions("Linkedin")}
            />
          </div>
          <div className={element("links__trad")}>
            <TranslateWidget />
          </div>
          <div className={element("links__legal")}>
            <TextButton
              target="_blank"
              href="/TermosRINU.pdf"
              text="Termos e condições"
              className={element("links__legal__link")}
              onClick={() => handleFooterOptions("Termos e condições")}
              prefetch={false}
            />
          </div>
          <span className={element("links__copyright")}>
            © RINU {formatDate(new Date(), { year: "numeric" })}
          </span>
        </div>
      </footer>
    </ErrorBoundary>
  );
};

const TranslateWidget = () => {
  useEffect(() => {
    window.gtranslateSettings = {
      default_language: "pt",
      native_language_names: true,
      languages: ["pt", "en", "fr", "es"],
      wrapper_selector: ".gtranslate_wrapper",
      flag_size: 20,
    };
  }, []);

  return (
    <>
      <div className="gtranslate_wrapper" />
      <Script src="https://cdn.gtranslate.net/widgets/latest/flags.js" defer />
    </>
  );
};

export default Footer;
