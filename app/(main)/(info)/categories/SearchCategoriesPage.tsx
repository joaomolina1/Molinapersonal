"use client";

import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useAttributes } from "@/_models/search";
import {
  getMainSpaceCategories,
  getOtherSpaceCategories,
} from "@/(main)/search/_utils/attributes";
import TextBlock from "@/_design_system/TextBlock";
import FeatureCard from "@/_design_system/FeatureCard";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { SpaceCategory } from "@/_constants/space/categories";

const { block, element } = createBEMClasses("search-categories-page");

const SearchCategoriesPage = () => {
  const isMobile = useMediaQuery("large");
  const title = "Espaços para todo o tipo de eventos";
  const mainLabel = "Mais populares";
  const otherLabel = "Outras categorias";

  const { data: availableAttributes = [] } = useAttributes();
  const mainSpaceCategories = getMainSpaceCategories(availableAttributes);
  const otherSpaceCategories = getOtherSpaceCategories(availableAttributes);

  const pathname = usePathname();

  const handleSpaceCategorySearch = (space_type: SpaceCategory) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "null",
      Rinu_ItemType: "space_category",
      Rinu_eLabel1: space_type,
    });
  };

  return (
    <div className={block()}>
      <div className={element("section")}>
        <TextBlock
          microtitle="Categorias"
          subtitle={isMobile ? title : mainLabel}
          title={isMobile ? undefined : title}
          label={isMobile ? mainLabel : undefined}
        />
        <div className={element("grid")}>
          {mainSpaceCategories.map((category) => (
            <FeatureCard
              key={category.id}
              label={category.label}
              photo={`/space-categories/${category.id}.jpeg`}
              icon={category.icon}
              href={`/search?category=${category.id}`}
              onClick={() => handleSpaceCategorySearch(category.id)}
            />
          ))}
        </div>
      </div>
      <div className={element("section")}>
        <TextBlock
          subtitle={isMobile ? undefined : otherLabel}
          label={isMobile ? otherLabel : undefined}
        />
        <div className={element("grid")}>
          {otherSpaceCategories.map((category) => (
            <FeatureCard
              key={category.id}
              label={category.label}
              photo={`/space-categories/${category.id}.jpeg`}
              icon={category.icon}
              href={`/search?category=${category.id}`}
              onClick={() => handleSpaceCategorySearch(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchCategoriesPage;
