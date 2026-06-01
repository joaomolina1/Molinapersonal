import Avatar from "@/_design_system/Avatar";
import { useRouterPush } from "@/_services/navigation";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const { block, element } = createBEMClasses("quote-request-button");

const QuoteRequestButton = ({
  onRequestQuote,
}: {
  onRequestQuote: () => void;
}) => {
  const isMobile = useMediaQuery("large");
  const pathname = usePathname();
  const routerPush = useRouterPush();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(false);

    const timeId = setTimeout(() => {
      setCollapsed(true);
    }, 5000);

    return () => {
      clearTimeout(timeId);
    };
  }, [pathname]);

  const handleFocus = () => {
    setCollapsed(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setCollapsed(true);
    }, 500);
  };

  const requestQuote = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "enquire_request",
      Rinu_ItemType: "float",
    });

    if (isMobile) {
      routerPush("/quote-request");
    } else {
      onRequestQuote();
    }
  };

  return (
    <div
      className={block({ collapsed })}
      onFocus={handleFocus}
      onMouseEnter={handleFocus}
      onBlur={handleBlur}
      onMouseLeave={handleBlur}
    >
      <button className={element("main")} onClick={requestQuote}>
        <div className={element("main__qa")}>
          <p className={element("main__question")}>Pedir orçamento</p>
          <p className={element("main__answer")}>Resposta em 12h úteis</p>
        </div>
        <div className={element("main__arrow")}>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.33333 0V1.33333H7.72667L0 9.06L0.94 10L8.66667 2.27333V6.66667H10V0H3.33333Z"
              fill="white"
            />
          </svg>
        </div>
      </button>
      <button className={element("avatars")} onClick={requestQuote}>
        {["matilde", "afonso", "luisa"].map((image) => (
          <div className={element("avatars__item")} key={image}>
            <Avatar
              url={`/quote-request-banner/${image}.webp`}
              size="medium"
              imagePosition="top"
            />
          </div>
        ))}
      </button>
    </div>
  );
};

export default QuoteRequestButton;
