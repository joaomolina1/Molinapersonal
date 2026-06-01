import Button, { IconButton } from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import PacksTable from "./PacksTable";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Stack from "@/_design_system/Stack";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { Venue } from "@/_models/venue";
import { Space, useCreateSpace, useDeleteSpace } from "@/_models/space";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import { useCreatePack, useDeletePack, usePacks } from "@/_models/pack";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import Modal from "@/_design_system/Modal";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsShow from "@/_design_system/_icons/UserInterface/Actions/Show.svg";
import EmptyState from "@/_components/EmptyState";
import { useRouterPush } from "@/_services/navigation";
import { DashboardList } from "../../useDashboardList";
import {
  Cell,
  Column,
  ExpandableRow,
  ExpandableRowProvider,
  ExpandedRow,
  ExpandIconCell,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";

const SpacesTable = ({ venue }: { venue: DashboardList["venues"][number] }) => {
  const isMobile = useMediaQuery("large");

  if (!venue.spaces.length) {
    return (
      <div>
        <NoSpaces venue={venue.venue} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <Stack gap="0.5rem">
        <Stack gap="1rem">
          {venue.spaces.map((space) => (
            <SpaceCard key={space.space.id} space={space} venue={venue.venue} />
          ))}
        </Stack>
        {!venue.venue.isInProgress && (
          <div style={{ alignItems: "flex-start" }}>
            <AddSpaceButton venue={venue.venue} />
          </div>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="0.5rem">
      <TableWrapper>
        <Table
          ariaLabel={
            venue.venue.isServicesJourney
              ? "Serviços da empresa"
              : "Espaços do local"
          }
        >
          <TableHeader>
            <Column isRowHeader>ID</Column>
            <Column>
              {venue.venue.isServicesJourney ? "Serviço" : "Espaço"}
            </Column>
            <Column>Reservas</Column>
            <Column>Estado</Column>
            <Column />
            <Column />
          </TableHeader>
          <TableBody>
            {venue.spaces.map((space, index) => (
              <SpaceRow
                key={space.space.id}
                odd={index % 2 === 1}
                space={space}
                venue={venue.venue}
              />
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
      {!venue.venue.isInProgress && (
        <div style={{ alignItems: "flex-start" }}>
          <AddSpaceButton venue={venue.venue} />
        </div>
      )}
    </Stack>
  );
};

const SpaceRow = ({
  odd,
  space,
  venue,
}: {
  odd: boolean;
  space: DashboardList["venues"][number]["spaces"][number];
  venue: Venue;
}) => {
  const editLink = `/onboarding/space?spaceID=${space.space.id}`;
  const continueLink = useContinueLink(space.space);

  return (
    <ExpandableRowProvider odd={odd} defaultExpanded>
      <ExpandableRow>
        <Cell style={{ paddingInline: 8 }}>
          <div>
            <Button
              type="link"
              label={space.space.reference}
              leftIcon={<IconUserInterfaceActionsShow />}
              href={`/onboarding/recap?spaceID=${space.space.id}&mode=view`}
              disabled={space.space.isInProgress}
            />
          </div>
        </Cell>
        <Cell>
          <div>{space.space.name || "Sem nome"}</div>
        </Cell>
        <Cell>
          <div>{space.bookings.length}</div>
        </Cell>
        <Cell>
          <div>
            <Tag
              size="small"
              text={space.space.statusWording.label}
              type={space.space.statusWording.tagType}
            />
          </div>
        </Cell>
        <Cell>
          <Stack row gap="1.5rem" justifyContent="center">
            {!venue.isInProgress && (
              <IconButton
                ariaLabel={space.space.isInProgress ? "Continuar" : "Editar"}
                icon={<IconUserInterfaceActionsEdit />}
                type="primary"
                href={space.space.isInProgress ? continueLink : editLink}
                style={{ fontSize: "1rem" }}
              />
            )}
            {space.space.isInProgress && (
              <DeleteSpaceButton space={space.space} />
            )}
          </Stack>
        </Cell>
        <ExpandIconCell />
      </ExpandableRow>
      <SpacePacks space={space.space} isMobile={false} />
    </ExpandableRowProvider>
  );
};

const { block, element } = createBEMClasses("space-card");

const SpaceCard = ({
  space,
  venue,
}: {
  space: DashboardList["venues"][number]["spaces"][number];
  venue: Venue;
}) => {
  const [ref, scrollIntoView] = useScrollIntoView<HTMLDivElement>(false);
  const [expanded, setExpanded] = useState(true);

  const editLink = `/onboarding/space?spaceID=${space.space.id}`;
  const continueLink = useContinueLink(space.space);

  return (
    <Stack className={block()} gap="0.5rem" ref={ref}>
      <Stack gap="0.5rem">
        <Stack row justifyContent="space-between" alignItems="flex-start">
          <ValueWithLabel
            label={venue.isServicesJourney ? "Serviço" : "Espaço"}
            value={`${space.space.reference} - ${
              space.space.name || "Sem nome"
            }`}
          />
          <Stack row gap="0.5rem" flexWrap="nowrap">
            {!venue.isInProgress && (
              <IconButton
                icon={<IconUserInterfaceActionsEdit />}
                style={{ fontSize: "1rem" }}
                href={space.space.isInProgress ? continueLink : editLink}
                ariaLabel={space.space.isInProgress ? "Continuar" : "Editar"}
              />
            )}
            {space.space.isInProgress && (
              <DeleteSpaceButton space={space.space} />
            )}
            {!space.space.isInProgress && (
              <IconButton
                icon={<IconUserInterfaceActionsShow />}
                style={{ fontSize: "1rem" }}
                href={`/onboarding/recap?spaceID=${space.space.id}&mode=view`}
                ariaLabel="Ver detalhes"
              />
            )}
            <IconButton
              ariaLabel={expanded ? "Esconder packs" : "Ver packs"}
              icon={
                expanded ? (
                  <IconUserInterfaceNavigationArrowUp />
                ) : (
                  <IconUserInterfaceNavigationArrowDown />
                )
              }
              style={{ fontSize: "1rem" }}
              onClick={() => {
                setExpanded(!expanded);

                if (!expanded) {
                  scrollIntoView();
                }
              }}
            />
          </Stack>
        </Stack>
        <div className={element("grid")}>
          <ValueWithLabel
            label="Estado"
            value={
              <Tag
                size="small"
                text={space.space.statusWording.label}
                type={space.space.statusWording.tagType}
              />
            }
          />
        </div>
      </Stack>
      {expanded && <SpacePacks space={space.space} isMobile />}
    </Stack>
  );
};

const SpacePacks = ({
  space,
  isMobile,
}: {
  space: Space;
  isMobile: boolean;
}) => {
  const { data: packs, isPending: isPendingPacks } = usePacks({
    spaceID: space.id,
  });

  if (isPendingPacks || !packs) {
    return null;
  }

  if (isMobile) {
    return packs.length ? (
      <>
        <PacksTable packs={packs} space={space} />
        {!space.isInProgress && <AddPackButton space={space} />}
      </>
    ) : (
      <NoPacks space={space} />
    );
  }

  return (
    <ExpandedRow>
      <Cell />
      <Cell style={{ paddingInline: 0 }}>
        {packs.length ? (
          <>
            <PacksTable packs={packs} space={space} />
            {!space.isInProgress && <AddPackButton space={space} />}
          </>
        ) : (
          <NoPacks space={space} />
        )}
      </Cell>
      <Cell />
      <Cell />
      <Cell />
      <Cell />
    </ExpandedRow>
  );
};

const AddSpaceButton = ({ venue }: { venue: Venue }) => {
  const routerPush = useRouterPush();
  const {
    mutateAsync: createSpace,
    isPending: isPendingCreateSpace,
    isSuccess: isSuccessCreateSpace,
  } = useCreateSpace();

  const addNewSpace = async () => {
    const space = await createSpace({ venueID: venue.id });

    routerPush(`/onboarding/space?spaceID=${space.id}`);
  };

  return (
    <Button
      label={
        venue.isServicesJourney
          ? "Adicionar novo serviço"
          : "Adicionar novo espaço"
      }
      leftIcon={<IconUserInterfaceActionsAdd />}
      type="link"
      onClick={addNewSpace}
      loading={isPendingCreateSpace || isSuccessCreateSpace}
    />
  );
};

const NoSpaces = ({ venue }: { venue: Venue }) => {
  const routerPush = useRouterPush();
  const {
    mutateAsync: createSpace,
    isPending: isPendingCreateSpace,
    isSuccess: isSuccessCreateSpace,
  } = useCreateSpace();

  const addNewSpace = async () => {
    const space = await createSpace({ venueID: venue.id });

    routerPush(`/onboarding/space?spaceID=${space.id}`);
  };

  return (
    <EmptyState
      text={{
        subtitle: venue.isServicesJourney
          ? "Sem serviços associados"
          : "Sem espaços associados",
        body: venue.isServicesJourney
          ? "Esta empresa não tem serviços associados"
          : "Este local não tem espaços associados",
      }}
      action={
        venue.isInProgress
          ? undefined
          : {
              label: venue.isServicesJourney
                ? "Adicionar serviço"
                : "Adicionar espaço",
              onClick: addNewSpace,
              loading: isPendingCreateSpace || isSuccessCreateSpace,
            }
      }
      withBorder
    />
  );
};

const AddPackButton = ({ space }: { space: Space }) => {
  const routerPush = useRouterPush();

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const addNewPack = async () => {
    const pack = await createPack({ spaceID: space.id });

    routerPush(`/onboarding/pack?packID=${pack.id}`);
  };

  return (
    <Button
      label="Adicionar novo pack"
      leftIcon={<IconUserInterfaceActionsAdd />}
      type="link"
      onClick={addNewPack}
      loading={isPendingCreatePack || isSuccessCreatePack}
    />
  );
};

const NoPacks = ({ space }: { space: Space }) => {
  const routerPush = useRouterPush();

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const addNewPack = async () => {
    const pack = await createPack({ spaceID: space.id });

    routerPush(`/onboarding/pack?packID=${pack.id}`);
  };

  return (
    <EmptyState
      text={{
        subtitle: "Sem packs associados",
        body: space.isServicesJourney
          ? "Este serviço não tem packs associados"
          : "Este espaço não tem packs associados",
      }}
      action={
        space.isInProgress
          ? undefined
          : {
              label: "Adicionar pack",
              onClick: addNewPack,
              loading: isPendingCreatePack || isSuccessCreatePack,
            }
      }
    />
  );
};

const useContinueLink = (space: Space) => {
  const { data: packs } = usePacks(
    { spaceID: space.id },
    { enabled: space.isCompletedPage1 && space.isCompletedPage2 },
  );

  const firstPack = packs?.[0];

  const isInStep2 =
    !space.isCompletedPage1 || (space.isServicesJourney && !firstPack);
  const isInStep3 =
    space.isVenuesJourney && (!space.isCompletedPage2 || !firstPack);
  const isInStep4 = !firstPack?.isCompleted;
  const isInStep4Recap = !!packs?.some((pack) => !pack.isCompleted);

  const step2Link = `/onboarding/space?spaceID=${space?.id}`;
  const step3Link = `/onboarding/space-details?spaceID=${space?.id}`;
  const step4Link = `/onboarding/pack?packID=${firstPack?.id}`;
  const step4RecapLink = `/onboarding/packs?spaceID=${space?.id}`;
  const step5Link = `/onboarding/recap?spaceID=${space?.id}&mode=submit`;

  return isInStep2
    ? step2Link
    : isInStep3
      ? step3Link
      : isInStep4
        ? step4Link
        : isInStep4Recap
          ? step4RecapLink
          : step5Link;
};

const DeleteSpaceButton = ({ space }: { space: Space }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("large");

  const { mutateAsync: deletePack, isPending: isPendingDeletePack } =
    useDeletePack();

  const { mutateAsync: deleteSpace, isPending: isPendingDeleteSpace } =
    useDeleteSpace();

  const { data: packs = [] } = usePacks({
    spaceID: space.id,
  });

  return (
    <>
      {isMobile ? (
        <IconButton
          ariaLabel="Apagar"
          icon={<IconUserInterfaceActionsDelete />}
          onClick={() => setIsOpen(true)}
          style={{ fontSize: "1rem" }}
        />
      ) : (
        <IconButton
          ariaLabel="Apagar"
          icon={<IconUserInterfaceActionsDelete />}
          type="primary"
          style={{ fontSize: "1rem" }}
          onClick={() => setIsOpen(true)}
        />
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel={
          space.isServicesJourney ? "Eliminar serviço" : "Eliminar espaço"
        }
        width="medium"
      >
        <Stack gap="2.5rem">
          <TextBlock
            subtitle={
              space.isServicesJourney
                ? "Deseja eliminar o serviço?"
                : "Deseja eliminar o espaço?"
            }
            body="Todos os packs já criados e associados também serão eliminados."
          />
          <Stack gap="1rem">
            <Button
              label={
                space.isServicesJourney ? "Eliminar serviço" : "Eliminar espaço"
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

                await deleteSpace({ id: space.id });

                setIsOpen(false);
              }}
              loading={isPendingDeletePack || isPendingDeleteSpace}
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

export default SpacesTable;
