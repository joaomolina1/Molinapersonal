"use client";

import Modal from "@/_design_system/Modal";
import {
  createContext,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import QuoteRequestButton from "./QuoteRequestButton";
import { usePathname, useSearchParams } from "next/navigation";
import { useCookies } from "@/_services/cookies";
import { useRouterReplace } from "@/_services/navigation";
import QuoteRequestForm from "./QuoteRequestForm";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { sendGAEvent } from "@next/third-parties/google";

type QuoteRequestModalData = {
  isOpen: boolean;
  context: {
    type: "quote-request" | "contact-request";
    venueID?: string;
    spaceID?: string;
    packID?: string;
  };
};

const INITIAL_VALUE: QuoteRequestModalData = {
  isOpen: false,
  context: { type: "quote-request" },
};

const QuoteRequestContext = createContext<{
  quoteRequestModalData: QuoteRequestModalData;
  setQuoteRequestModalData: (context: QuoteRequestModalData) => void;
}>({
  quoteRequestModalData: INITIAL_VALUE,
  setQuoteRequestModalData: () => {},
});

const SHOW_QUOTE_REQUEST_URL_PARAM = "showQuoteRequest";

export const QuoteRequestProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { cookies } = useCookies();

  const isOpenButton =
    !pathname.startsWith("/account") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/host") &&
    !pathname.startsWith("/onboarding");

  const [modalData, setModalData] =
    useState<QuoteRequestModalData>(INITIAL_VALUE);

  const isClosedCookiesBanner = !!cookies || cookies === undefined;

  const close = () => setModalData(INITIAL_VALUE);

  const handleSetModalData = (data: QuoteRequestModalData) => {
    if (data.isOpen && data.context.type === "quote-request") {
      sendGAEvent("event", "Rinu_ScreenView", {
        Rinu_ScreenName: pathname,
        Rinu_ItemCategory: "enquire_request",
        Rinu_eLabel1: data.context.venueID,
        Rinu_eLabel2: data.context.spaceID,
      });
    }

    setModalData(data);
  };

  return (
    <QuoteRequestContext
      value={{
        quoteRequestModalData: modalData,
        setQuoteRequestModalData: handleSetModalData,
      }}
    >
      {children}
      {!pathname.startsWith("/quote-request") && (
        <>
          <Modal
            isOpen={modalData.isOpen && isClosedCookiesBanner}
            onOpenChange={(newIsOpen) => {
              if (newIsOpen) {
                setModalData({ ...modalData, isOpen: true });
              } else {
                close();
              }
            }}
            width="x-large"
            mobileHeight="almost-fullscreen"
            showCloseButton={false}
            ariaLabel="Pedido de orçamento"
            contentStyle={{ padding: 0 }}
          >
            <div className="quote-request-modal">
              <Suspense fallback={null}>
                <QuoteRequestForm
                  type={modalData.context.type}
                  onClose={close}
                />
              </Suspense>
            </div>
          </Modal>
          {isOpenButton && !modalData.isOpen && isClosedCookiesBanner && (
            <QuoteRequestButton
              onRequestQuote={() =>
                setModalData({
                  isOpen: true,
                  context: { type: "quote-request" },
                })
              }
            />
          )}
          <Suspense fallback={null}>
            <QuoteRequestHandleUrlParam />
          </Suspense>
        </>
      )}
    </QuoteRequestContext>
  );
};

export const useQuoteRequestContext = () => useContext(QuoteRequestContext);

const QuoteRequestHandleUrlParam = () => {
  const isMobile = useMediaQuery("large");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routerReplace = useRouterReplace();

  const { setQuoteRequestModalData } = useQuoteRequestContext();

  useEffect(() => {
    if (
      searchParams.get(SHOW_QUOTE_REQUEST_URL_PARAM) === "true" &&
      isMobile !== undefined
    ) {
      if (isMobile) {
        routerReplace("/quote-request");
      } else {
        setQuoteRequestModalData({
          isOpen: true,
          context: { type: "quote-request" },
        });

        const params = new URLSearchParams(searchParams);
        params.delete(SHOW_QUOTE_REQUEST_URL_PARAM);
        const paramsString = params.toString();
        routerReplace([pathname, paramsString].join("?"), { scroll: false });
      }
    }
  }, [
    isMobile,
    pathname,
    routerReplace,
    searchParams,
    setQuoteRequestModalData,
  ]);

  return <></>;
};
