import { createBEMClasses } from "@/_utils/classname";
import Header from "@/_components/Header";
import { HeroSearch } from "./HeroSearch";
import { Fragment } from "react";
import { ErrorBoundary } from "@/_services/sentry";
import QuoteRequestBannerCarousel from "@/_components/QuoteRequestBanner";
import {
  BANNER_TYPES_FOR_LANDING_EVENTS,
  LandingEventType,
} from "@/(main)/event/[eventType]/wordings";

const { block, element } = createBEMClasses("hero-banner");

const HeroBanner = ({
  backgroundUrl,
  title,
  subtitle,
  defaultEventType,
}: {
  backgroundUrl: string;
  title: string[];
  subtitle?: string;
  defaultEventType?: LandingEventType;
}) => {
  const bannerTypes = defaultEventType
    ? BANNER_TYPES_FOR_LANDING_EVENTS[defaultEventType]
    : undefined;

  const showBanner = defaultEventType ? !!bannerTypes : true;

  return (
    <>
      <div className={block()}>
        <div
          className={element("background")}
          style={{
            backgroundImage: `linear-gradient(rgba(39, 43, 48, 0.5),rgba(39, 43, 48, 0.5)), url("${backgroundUrl}")`,
          }}
        >
          <div className={element("background__content")}>
            <ErrorBoundary>
              <div style={{ zIndex: 1 }}>
                <Header variant="inverted" />
                <h1>
                  {title.map((titleItem, index) => (
                    <Fragment key={index}>
                      {index > 0 && <br />}
                      {titleItem}
                    </Fragment>
                  ))}
                </h1>
                {subtitle && <h2>{subtitle}</h2>}
                <HeroSearch
                  mode="hero"
                  defaultEventType={defaultEventType}
                  listenOnEnter
                />
              </div>
              {showBanner && (
                <div className={element("banner")}>
                  <QuoteRequestBannerCarousel types={bannerTypes} />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
