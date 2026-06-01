"use client";

import { getAllSpaceCategories } from "@/(main)/search/_utils/attributes";
import Button from "@/_design_system/Button";
import FeatureCard from "@/_design_system/FeatureCard";
import HighlightCard from "@/_design_system/HighlightCard";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import { useAttributes } from "@/_models/search";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { SpaceCategory } from "@/_constants/space/categories";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("home-categories");

const Categories = () => {
  const isMobile = useMediaQuery("large");
  const title = "Espaços para todo o tipo de eventos";

  const { data: availableAttributes = [] } = useAttributes();
  const spaceCategories = getAllSpaceCategories(availableAttributes);

  const pathname = usePathname();
  const handleCategoriesSearch = (type: SpaceCategory | "more") => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "space_category",
      Rinu_eLabel1: type === "more" ? "Mais categorias" : type,
    });
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <TextBlock
          subtitle={isMobile ? title : undefined}
          title={isMobile ? undefined : title}
          className={element("title")}
        />
        {isMobile ? (
          <div className={element("scroll")}>
            {spaceCategories.slice(0, 4).map((category) => (
              <div key={category.id} className={element("scroll__item")}>
                <HighlightCard
                  label={category.label}
                  photo={`/space-categories/${category.id}.jpeg`}
                  href={`/search?category=${category.id}`}
                  onClick={() => handleCategoriesSearch(category.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={element("grid")}>
            {spaceCategories.slice(0, 4).map((category) => (
              <FeatureCard
                key={category.id}
                label={category.label}
                photo={`/space-categories/${category.id}.jpeg`}
                icon={category.icon}
                href={`/search?category=${category.id}`}
                onClick={() => handleCategoriesSearch(category.id)}
              />
            ))}
          </div>
        )}
        <div className={element("see-all")}>
          <Button
            type="link"
            label="Ver todas as categorias"
            rightIcon={<IconUserInterfaceNavigationArrowRight />}
            href="/categories"
            onClick={() => handleCategoriesSearch("more")}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Categories;
