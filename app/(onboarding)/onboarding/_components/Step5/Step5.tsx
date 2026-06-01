"use client";

import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tabs, { TabPanel } from "@/_design_system/Tabs";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousSecurity from "@/_design_system/_icons/UserInterface/Miscellaneous/Security.svg";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import IconUserInterfacePaymentCard from "@/_design_system/_icons/UserInterface/Payment/Card.svg";
import { Journey, Venue, useVenue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Wrapper from "../Wrapper";
import VenueRecap from "./VenueRecap";
import SpaceRecap from "./SpaceRecap";
import { Space, useSpace, useSubmitSpace } from "@/_models/space";
import PacksRecap from "./PacksRecap";
import { Pack, usePacks } from "@/_models/pack";
import { useRouterPush } from "@/_services/navigation";

const { block, element } = createBEMClasses("onboarding-recap");

const Step5Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;
  const mode =
    (searchParams.get("mode") as "submit" | "view" | "admin") ?? undefined;

  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID);
  const { data: venue, isLoading: isLoadingVenue } = useVenue(space?.venueID);
  const { data: packs, isLoading: isLoadingPacks } = usePacks({ spaceID });

  if (isLoadingSpace || isLoadingVenue || isLoadingPacks) {
    return null;
  }

  if (
    !spaceID ||
    (mode !== "submit" && mode !== "view" && mode !== "admin") ||
    !space ||
    !venue ||
    !packs ||
    (mode === "view" && space.isInProgress)
  ) {
    router.replace("/");
    return null;
  }

  return (
    <Step5
      venue={venue}
      space={space}
      packs={packs.filter((pack) =>
        mode === "view" ? !pack.isInProgress : true,
      )}
      mode={mode}
    />
  );
};

const previewTabs = (jouney: Journey) =>
  [
    {
      id: "venue",
      label: jouney === "services" ? "Empresa" : "Local",
      icon: <IconUserInterfaceMiscellaneousUser />,
    },
    {
      id: "space",
      label: jouney === "services" ? "Serviço" : "Espaço",
      icon: <IconUserInterfaceMiscellaneousSecurity />,
    },
    {
      id: "packs",
      label: "Packs",
      icon: <IconUserInterfacePaymentCard />,
    },
  ] as const;

type PreviewTab = ReturnType<typeof previewTabs>[number]["id"];

const Step5 = ({
  venue,
  space,
  packs,
  mode,
}: {
  venue: Venue;
  space: Space;
  packs: Pack[];
  mode: "submit" | "view" | "admin";
}) => {
  const routerPush = useRouterPush();

  const [tab, setTab] = useState<PreviewTab>(
    venue.isInProgress ? "venue" : space.isInProgress ? "space" : "packs",
  );

  const {
    mutateAsync: submit,
    isPending: isPendingSubmit,
    isSuccess: isSuccessSubmit,
  } = useSubmitSpace();

  const exit = () => {
    if (mode === "admin") {
      routerPush("/admin");
    } else {
      routerPush("/host");
    }
  };

  const save = async () => {
    await submit({ id: space.id });

    routerPush(`/onboarding/success?spaceID=${space.id}`);
  };

  const disabledTabs: PreviewTab[] = [];

  if (mode === "submit" && !venue.isInProgress) {
    disabledTabs.push("venue");
  }

  if (mode === "submit" && !space.isInProgress) {
    disabledTabs.push("space");
  }

  return (
    <Wrapper
      step={space.isServicesJourney ? 4 : 5}
      saveAndExitButton={{
        label: mode === "submit" ? "Gravar e sair" : "Sair",
        onClick: exit,
      }}
      nextButton={
        mode === "submit"
          ? {
              label: "Concluir",
              onClick: save,
              loading: isPendingSubmit || isSuccessSubmit,
              disabled: !packs.some((pack) => pack.isInProgress),
            }
          : undefined
      }
      previousButton={
        mode === "submit"
          ? {
              label: "Anterior",
              href: `/onboarding/packs?spaceID=${space.id}`,
            }
          : undefined
      }
      totalSteps={space.isServicesJourney ? 4 : 5}
    >
      <Stack className={block()}>
        <div className={element("header")}>
          <TextBlock subtitle={venue.name} />
          <Button
            label="Pré-visualizar o anúncio"
            type="secondary"
            href={`/onboarding/preview?spaceID=${space.id}&mode=${mode}`}
          />
        </div>
        <Tabs
          tabs={previewTabs(space.journey)}
          value={tab}
          onChange={setTab}
          disabledTabs={disabledTabs}
          className={element("tabs")}
        >
          <TabPanel id="venue">
            <VenueRecap venue={venue} />
          </TabPanel>
          <TabPanel id="space">
            <SpaceRecap space={space} />
          </TabPanel>
          <TabPanel id="packs">
            <PacksRecap packs={packs} spaceID={space.id} />
          </TabPanel>
        </Tabs>
      </Stack>
    </Wrapper>
  );
};

export default Step5Wrapper;
