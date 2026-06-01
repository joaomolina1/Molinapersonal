"use client";

import { createBEMClasses } from "@/_utils/classname";

import { Pack, useCreatePack, usePacks } from "@/_models/pack";
import { useRouter, useSearchParams } from "next/navigation";
import Wrapper from "../Wrapper";
import IllustrationOnboardingStep4 from "@/_design_system/_illustrations/OnboardingStep4.svg";
import TextBlock from "@/_design_system/TextBlock";
import Stack from "@/_design_system/Stack";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import { Space, useSpace } from "@/_models/space";
import { useState } from "react";
import PackCard from "../_shared/PackCard";
import { useRouterPush } from "@/_services/navigation";

const { block, element } = createBEMClasses("onboarding__step");

const Step4Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;

  const { data: packs, isLoading: isLoadingPacks } = usePacks({ spaceID });
  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID);

  if (isLoadingPacks || isLoadingSpace) {
    return null;
  }

  if (!spaceID || !packs || !packs.length || !space) {
    router.replace("/");
    return null;
  }

  return <Step4Recap spaceID={spaceID} packs={packs} space={space} />;
};

const Step4Recap = ({
  spaceID,
  packs,
  space,
}: {
  spaceID: string;
  packs: Pack[];
  space: Space;
}) => {
  const routerPush = useRouterPush();

  const [showErrors, setShowErrors] = useState(false);

  const saveAndExit = () => {
    routerPush("/host");
  };

  const saveAndContinue = () => {
    setShowErrors(true);

    const areAllPacksCompleted = packs.every((pack) => pack.isCompleted);

    if (areAllPacksCompleted) {
      routerPush(`/onboarding/recap?spaceID=${spaceID}&mode=submit`);
    }
  };

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const addPack = async () => {
    const newPack = await createPack({ spaceID });
    routerPush(`/onboarding/pack?packID=${newPack.id}`);
  };

  const showPackStatus = packs.some((pack) => !pack.isInProgress);

  return (
    <Wrapper
      step={space.isServicesJourney ? 3 : 4}
      saveAndExitButton={{
        label: "Gravar e sair",
        onClick: saveAndExit,
      }}
      nextButton={{
        label: "Continuar",
        onClick: saveAndContinue,
        disabled: !packs.some((pack) => pack.isInProgress),
      }}
      previousButton={
        space.isInProgress
          ? {
              label: "Anterior",
              href: space.isServicesJourney
                ? `/onboarding/space?spaceID=${spaceID}`
                : `/onboarding/space-details?spaceID=${spaceID}`,
            }
          : undefined
      }
      totalSteps={space.isServicesJourney ? 4 : 5}
    >
      <div className={block()}>
        <div className={element("intro")}>
          <IllustrationOnboardingStep4 />
          <TextBlock
            microtitle={space.isServicesJourney ? "Passo 3" : "Passo 4"}
            title="Packs"
            body={
              space.isServicesJourney
                ? "Verifique os packs adicionados ao serviço"
                : "Verifique os packs adicionados ao espaço"
            }
          />
        </div>

        <Stack gap="1.5rem">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              showStatus={showPackStatus}
              enableEdit={pack.isInProgress}
              error={
                showErrors && !pack.isCompleted
                  ? "Por favor complete ou elimine este pack"
                  : undefined
              }
            />
          ))}
          <Stack row justifyContent="flex-end">
            <Button
              type="secondary"
              label="Adicionar outro pack"
              leftIcon={<IconUserInterfaceActionsAdd />}
              onClick={addPack}
              loading={isPendingCreatePack || isSuccessCreatePack}
            />
          </Stack>
        </Stack>
      </div>
    </Wrapper>
  );
};

export default Step4Wrapper;
