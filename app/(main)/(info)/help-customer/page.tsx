import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import Steps from "./_components/Steps";
import HelpFaq from "./_components/HelpFaq";
import { Metadata } from "next";

const { block } = createBEMClasses("help-customer-page");

export const metadata: Metadata = {
  title: "Como funciona",
  openGraph: {
    title: "Como funciona",
    images: "/hero_background.webp",
  },
};

export default function HelpCustomer() {
  return (
    <Stack gap="1rem" className={block()}>
      <Steps />
      <HelpFaq />
    </Stack>
  );
}
