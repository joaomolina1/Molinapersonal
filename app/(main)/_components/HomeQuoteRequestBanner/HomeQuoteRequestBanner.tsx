import QuoteRequestBannerCarousel from "@/_components/QuoteRequestBanner";
import { BannerType } from "@/_components/QuoteRequestBanner/bannerData";
import { createBEMClasses } from "@/_utils/classname";

const { block } = createBEMClasses("home-quote-request-banner");

const HomeQuoteRequestBanner = ({ types }: { types?: BannerType[] }) => {
  return (
    <div className={block()}>
      <QuoteRequestBannerCarousel types={types} />
    </div>
  );
};

export default HomeQuoteRequestBanner;
