"use client";

import { Journey, useCreateVenue } from "@/_models/venue";
import { useRouterPush, useRouterReplace } from "@/_services/navigation";
import { useState } from "react";
import Wrapper from "../Wrapper";
import { useHostStatus } from "@/_components/Header/useHostStatus";
import { Step01 } from "./Step01";
import { Step02 } from "./Step02";

const Step0 = () => {
  const [journey, setJourney] = useState<Journey | null>(null);

  const routerPush = useRouterPush();
  const routerReplace = useRouterReplace();
  const hostStatus = useHostStatus();

  const {
    mutateAsync: createVenue,
    isPending: isPendingCreateVenue,
    isSuccess: isSuccessCreateVenue,
  } = useCreateVenue();

  const start = async () => {
    if (!journey) {
      return;
    }

    const newVenue = await createVenue({ journey });
    routerReplace(`/onboarding/venue?venueID=${newVenue.id}`);
  };

  return (
    <Wrapper
      step={0}
      saveAndExitButton={{
        label: "Cancelar",
        onClick: () => routerPush(hostStatus?.isAlreadyHost ? "/host" : "/"),
      }}
      nextButton={
        journey
          ? {
              label: "Começar",
              onClick: start,
              loading: isPendingCreateVenue || isSuccessCreateVenue,
            }
          : undefined
      }
      previousButton={
        journey
          ? {
              label: "Anterior",
              onClick: () => setJourney(null),
            }
          : undefined
      }
    >
      {!journey && <Step01 setJourney={setJourney} />}
      {!!journey && <Step02 journey={journey} />}
    </Wrapper>
  );
};

export default Step0;
