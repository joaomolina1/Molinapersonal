"use client";

import Button from "@/_design_system/Button";
import { createBEMClasses } from "@/_utils/classname";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const { block } = createBEMClasses("ai-planner-button");

const AIPlannerButton = ({
  source,
  className,
}: {
  source: string;
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <div className={block(undefined, className)}>
      <Button
        type="secondary"
        label="✨ AI Planner"
        href="/builder"
        onClick={() => {
          sendGAEvent("event", "Rinu_CustomClick", {
            Rinu_ScreenName: pathname,
            Rinu_ItemCategory: "Standard",
            Rinu_ItemType: "event_builder_entry",
            Rinu_eLabel1: source,
          });
        }}
      />
    </div>
  );
};

export default AIPlannerButton;
