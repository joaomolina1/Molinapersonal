"use client";

import { createBEMClasses } from "@/_utils/classname";
import Wrapper from "../Wrapper";
import Stack from "@/_design_system/Stack";
import IllustrationSuccess from "@/_design_system/_illustrations/Success.svg";
import TextBlock from "@/_design_system/TextBlock";
import Button from "@/_design_system/Button";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useRouter, useSearchParams } from "next/navigation";
import { Space, useCreateSpace, useSpace } from "@/_models/space";
import { useRouterPush } from "@/_services/navigation";

const { block } = createBEMClasses("onboarding__step");

const Step6Wrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;

  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID);

  if (isLoadingSpace) {
    return null;
  }

  if (!spaceID || !space) {
    router.replace("/");
    return null;
  }

  return <Step6 space={space} />;
};

const Step6 = ({ space }: { space: Space }) => {
  const routerPush = useRouterPush();
  const isMobile = useMediaQuery("large");

  const {
    mutateAsync: createSpace,
    isPending: isPendingCreateSpace,
    isSuccess: isSuccessCreateSpace,
  } = useCreateSpace();

  const addSpace = async () => {
    const newSpace = await createSpace({ venueID: space.venueID });
    routerPush(`/onboarding/space?spaceID=${newSpace.id}`);
  };

  const editPhrase = space.isServicesJourney
    ? "Pode editar ou adicionar novos serviços à sua empresa."
    : "Pode editar ou adicionar novos espaços ao seu local.";

  return (
    <Wrapper step={0}>
      <div className={block()}>
        <Stack row={!isMobile} gap="1.5rem" alignItems="center">
          <IllustrationSuccess />
          <TextBlock
            title={
              <>
                Já está!
                <br />
                {space.isServicesJourney
                  ? "A sua empresa foi enviada para revisão."
                  : "O seu local foi enviado para revisão."}
              </>
            }
          />
        </Stack>
        <Stack gap="0.5rem" alignItems="flex-start">
          {isMobile ? (
            <TextBlock label={editPhrase} />
          ) : (
            <TextBlock subtitle={editPhrase} />
          )}
          <Button
            type="link"
            label={
              space.isServicesJourney
                ? "Adicionar novo serviço"
                : "Adicionar novo espaço"
            }
            onClick={addSpace}
            loading={isPendingCreateSpace || isSuccessCreateSpace}
            style={{ paddingLeft: 0, paddingRight: 0 }}
          />
        </Stack>
        <Stack row gap="1rem" flexWrap="wrap">
          <Button type="secondary" label="Ir para a página inicial" href="/" />
          <Button type="primary" label="Ver dashboard" href="/host" />
        </Stack>
      </div>
    </Wrapper>
  );
};

export default Step6Wrapper;
