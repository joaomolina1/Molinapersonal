import { TabsRadioGroup } from "@/_design_system/Tabs";
import { createBEMClasses } from "@/_utils/classname";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Chip from "@/_design_system/Chip";
import IconUserInterfaceActionsMoveRight from "@/_design_system/_icons/UserInterface/Actions/MoveRight.svg";
import IconUserInterfaceActionsMoveLeft from "@/_design_system/_icons/UserInterface/Actions/MoveLeft.svg";
import { TabsRadioGroupProps } from "./TabsRadioGroup";

const { block, element } = createBEMClasses("scrollable-tabs-radio-group");

const ScrollableTabsRadioGroup = <T extends string>(
  props: TabsRadioGroupProps<T>,
) => {
  const ref = useRef<HTMLDivElement>(null);

  const [hasOverflowToTheRight, setHasOverflowToTheRight] = useState(false);
  const [hasOverflowToTheLeft, setHasOverflowToTheLeft] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      const { scrollWidth, offsetWidth, scrollLeft } = ref.current;
      setHasOverflowToTheRight(scrollWidth > offsetWidth + scrollLeft);
      setHasOverflowToTheLeft(scrollLeft > 0);
    }
  }, []);

  useEffect(() => {
    const node = ref.current;

    const handleScroll = () => {
      if (node) {
        const { scrollWidth, offsetWidth, scrollLeft } = node;

        setHasOverflowToTheRight(
          scrollWidth > Math.ceil(offsetWidth + scrollLeft),
        );
        setHasOverflowToTheLeft(scrollLeft > 0);
      }
    };

    if (node) {
      node.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      if (node) {
        node.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      }
    };
  }, []);

  const scroll = (direction: "right" | "left") => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "right" ? 300 : -300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={block()}>
      <div className={element("content")} ref={ref}>
        <TabsRadioGroup {...props} />
      </div>
      <div
        className={element("arrow", {
          direction: "left",
          visible: hasOverflowToTheLeft,
        })}
      >
        <Chip
          type="button"
          leftIcon={<IconUserInterfaceActionsMoveLeft />}
          onClick={() => scroll("left")}
        />
      </div>
      <div
        className={element("arrow", {
          direction: "right",
          visible: hasOverflowToTheRight,
        })}
      >
        <Chip
          type="button"
          leftIcon={<IconUserInterfaceActionsMoveRight />}
          onClick={() => scroll("right")}
        />
      </div>
    </div>
  );
};

export default ScrollableTabsRadioGroup;
