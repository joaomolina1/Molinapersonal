import Button, { IconButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack, { StackSeparator } from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { useDeletePack, usePacks } from "@/_models/pack";
import { Space, useDeleteSpace, useSpaces } from "@/_models/space";
import { Venue, useDeleteVenue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";

const { block, element } = createBEMClasses("host-venue-name");

const VenueName = ({
  venue,
  showEdit,
}: {
  venue: Venue;
  showEdit?: boolean;
}) => {
  const isMobile = useMediaQuery("large");

  const { data: spaces = [] } = useSpaces(
    { venueID: venue.id },
    { enabled: venue.isInProgress && venue.isCompleted },
  );

  const space = spaces?.[0];

  const { data: packs } = usePacks(
    { spaceID: space?.id },
    { enabled: !!space?.isCompletedPage1 && !!space?.isCompletedPage2 },
  );

  const firstPack = packs?.[0];

  const isInStep1 = !venue.isCompleted || !space;
  const isInStep2 =
    !space?.isCompletedPage1 || (space?.isServicesJourney && !firstPack);
  const isInStep3 =
    space?.isVenuesJourney && (!space?.isCompletedPage2 || !firstPack);
  const isInStep4 = !firstPack?.isCompleted;
  const isInStep4Recap = !!packs?.some((pack) => !pack.isCompleted);

  const step1Link = `/onboarding/venue?venueID=${venue.id}`;
  const step2Link = `/onboarding/space?spaceID=${space?.id}`;
  const step3Link = `/onboarding/space-details?spaceID=${space?.id}`;
  const step4Link = `/onboarding/pack?packID=${firstPack?.id}`;
  const step4RecapLink = `/onboarding/packs?spaceID=${space?.id}`;
  const step5Link = `/onboarding/recap?spaceID=${space?.id}&mode=submit`;

  const continueLink = isInStep1
    ? step1Link
    : isInStep2
      ? step2Link
      : isInStep3
        ? step3Link
        : isInStep4
          ? step4Link
          : isInStep4Recap
            ? step4RecapLink
            : step5Link;

  const editLink = step1Link;

  return (
    <Stack gap="0.125rem" className={block()}>
      <p className={element("id")}>{venue.reference}</p>
      <Stack row gap="1rem" alignItems="center">
        <p className={element("name")}>{venue.name || "Sem nome"}</p>
        <Stack row gap="1rem">
          {showEdit &&
            (venue.isInProgress ? (
              <>
                {isMobile ? (
                  <IconButton
                    ariaLabel="Continuar"
                    icon={<IconUserInterfaceActionsEdit />}
                    type="primary"
                    href={continueLink}
                  />
                ) : (
                  <Button
                    label="Continuar"
                    leftIcon={<IconUserInterfaceActionsEdit />}
                    type="link"
                    href={continueLink}
                  />
                )}
                {!isMobile && <StackSeparator />}
                <DeleteVenueButton venue={venue} space={space} />
              </>
            ) : isMobile ? (
              <IconButton
                ariaLabel="Editar"
                icon={<IconUserInterfaceActionsEdit />}
                type="primary"
                href={editLink}
              />
            ) : (
              <Button
                label="Editar"
                leftIcon={<IconUserInterfaceActionsEdit />}
                type="link"
                href={editLink}
              />
            ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

const DeleteVenueButton = ({
  venue,
  space,
}: {
  venue: Venue;
  space?: Space;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("large");

  const { mutateAsync: deletePack, isPending: isPendingDeletePack } =
    useDeletePack();

  const { mutateAsync: deleteSpace, isPending: isPendingDeleteSpace } =
    useDeleteSpace();

  const { mutateAsync: deleteVenue, isPending: isPendingDeleteVenue } =
    useDeleteVenue();

  const { data: packs = [] } = usePacks({ spaceID: space?.id });

  return (
    <>
      {isMobile ? (
        <IconButton
          ariaLabel="Apagar"
          icon={<IconUserInterfaceActionsDelete />}
          type="primary"
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <Button
          label="Apagar"
          leftIcon={<IconUserInterfaceActionsDelete />}
          type="link"
          onClick={() => setIsOpen(true)}
        />
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Eliminar local"
        width="medium"
      >
        <Stack gap="2.5rem">
          <TextBlock
            subtitle={
              venue.isServicesJourney
                ? "Deseja eliminar a empresa?"
                : "Deseja eliminar o local?"
            }
            body={
              venue.isServicesJourney
                ? "Todos os serviços e packs já criados e associados também serão eliminados."
                : "Todos os espaços e packs já criados e associados também serão eliminados."
            }
          />
          <Stack gap="1rem">
            <Button
              label={
                venue.isServicesJourney ? "Eliminar empresa" : "Eliminar local"
              }
              type="red"
              onClick={async () => {
                if (packs.length > 0) {
                  await Promise.all(
                    packs.map(
                      async (pack) => await deletePack({ id: pack.id }),
                    ),
                  );
                }

                if (space) {
                  await deleteSpace({ id: space.id });
                }

                await deleteVenue({ id: venue.id });

                setIsOpen(false);
              }}
              loading={
                isPendingDeletePack ||
                isPendingDeleteSpace ||
                isPendingDeleteVenue
              }
            />
            <Button
              label="Cancelar"
              type="secondary"
              onClick={() => setIsOpen(false)}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default VenueName;
