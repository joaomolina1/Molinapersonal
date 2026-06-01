"use client";

import { PrimaryHeader } from "@/_components/Header";
import SpacePage from "@/_components/SpacePage";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsMoveLeft from "@/_design_system/_icons/UserInterface/Actions/MoveLeft.svg";
import { Space, useSpace } from "@/_models/space";
import { Venue, useVenue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useRouter, useSearchParams } from "next/navigation";

const { block, element } = createBEMClasses("onboarding-space-preview");

const SpacePreviewWrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;
  const mode =
    (searchParams.get("mode") as "submit" | "view" | "admin") ?? undefined;

  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID);
  const { data: venue, isLoading: isLoadingVenue } = useVenue(space?.venueID);

  if (isLoadingSpace || isLoadingVenue) {
    return null;
  }

  if (
    !spaceID ||
    (mode !== "submit" && mode !== "view" && mode !== "admin") ||
    !space ||
    !venue ||
    (mode === "view" && space.isInProgress)
  ) {
    router.replace("/");
    return null;
  }

  return <SpacePreview venue={venue} space={space} mode={mode} />;
};

const SpacePreview = ({
  venue,
  space,
  mode,
}: {
  venue: Venue;
  space: Space;
  mode: "submit" | "view" | "admin";
}) => {
  const isMobile = useMediaQuery("large");

  return (
    <>
      <PrimaryHeader
        hideDefaultButton
        hideSession
        hideDrawer
        logoLink={false}
        className={element("header")}
      >
        <Stack row justifyContent="flex-end" style={{ width: "100%" }}>
          <Button
            label="Voltar"
            type={isMobile ? "secondary" : "secondary-inverted"}
            leftIcon={<IconUserInterfaceActionsMoveLeft />}
            href={`/onboarding/recap?spaceID=${space.id}&mode=${mode}`}
          />
        </Stack>
      </PrimaryHeader>
      <div className={block()}>
        <SpacePage space={space} venue={venue} mode="auth" />
      </div>
    </>
  );
};

export default SpacePreviewWrapper;
