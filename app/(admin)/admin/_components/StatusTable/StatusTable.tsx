import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsShow from "@/_design_system/_icons/UserInterface/Actions/Show.svg";
import { createBEMClasses } from "@/_utils/classname";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import StatusSelect from "./StatusSelect";
import { AdminList } from "../useAdminList";
import { formatDate } from "@/_utils/date";
import EmptyState from "@/_components/EmptyState";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import RinuCommission from "./RinuCommission";
import { DASHBOARD_ITEM_TYPES, DashboardItem } from "@/_models/dashboard";
import Stack from "@/_design_system/Stack";
import InputSelect from "@/_design_system/InputSelect";
import SkeletonLoader from "@/_design_system/SkeletonLoader";
import Pagination from "@/_design_system/Pagination";
import { useRouterPush } from "@/_services/navigation";
import { useCreateSpace, useDeleteSpace } from "@/_models/space";
import { useCreatePack, useDeletePack } from "@/_models/pack";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import { useDeleteVenue } from "@/_models/venue";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import { useState } from "react";
import Modal from "@/_design_system/Modal";
import TextBlock from "@/_design_system/TextBlock";
import CopyIconButton from "@/_components/CopyIconButton";
import CopyPackButton from "@/_components/CopyPackButton";

const { block, element } = createBEMClasses("status-table");

const StatusTable = ({ adminList }: { adminList: AdminList }) => {
  const {
    dashboardItems,
    isFetching,
    page,
    setPage,
    isLastPage,
    perPage,
    setPerPage,
  } = adminList;

  return (
    <Stack gap="2.5rem">
      <TableWrapper>
        <Table ariaLabel="Estados" className={block()}>
          <TableHeader>
            <Column isRowHeader>ID</Column>
            <Column>Tipo</Column>
            <Column>Local/Empresa</Column>
            <Column>Espaço/Serviço</Column>
            <Column>Pack</Column>
            <Column>Comissão RINU</Column>
            <Column>Estado atual</Column>
            <Column>Data da modificação</Column>
            <Column>Ações</Column>
          </TableHeader>
          <TableBody>
            {isFetching
              ? [...Array(perPage)].map((_, index) => (
                  <StatusRowSkeleton key={index} odd={index % 2 === 1} />
                ))
              : dashboardItems.map((item, index) => (
                  <StatusRow key={item.id} item={item} odd={index % 2 === 1} />
                ))}
          </TableBody>
        </Table>
        {dashboardItems.length === 0 && !isFetching && <NoItems />}
      </TableWrapper>
      {!!dashboardItems.length && (
        <Stack row justifyContent="flex-end" gap="0.5rem">
          <InputSelect
            value={perPage.toString()}
            onChange={(perPage) => setPerPage(parseInt(perPage))}
            label="Por página"
            options={["10", "20", "50", "100"].map((id) => ({
              id,
              text: id,
            }))}
            className={element("pagination-select")}
          />
          <Pagination page={page} setPage={setPage} isLastPage={isLastPage} />
        </Stack>
      )}
    </Stack>
  );
};

const StatusRowSkeleton = ({ odd }: { odd?: boolean }) => (
  <Row odd={odd}>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
    <Cell>
      <SkeletonLoader type="text" />
    </Cell>
  </Row>
);

const StatusRow = ({ item, odd }: { item: DashboardItem; odd?: boolean }) => {
  const editHref = {
    venue: `/onboarding/venue?venueID=${item.id}`,
    space: `/onboarding/space?spaceID=${item?.id}`,
    pack: `/onboarding/pack?packID=${item?.id}`,
  }[item.type];

  return (
    <>
      <Row odd={odd} id={item.id}>
        <Cell style={{ paddingInline: 8 }}>
          <Stack row gap="0.25rem">
            {item.type === "venue" || item.type === "pack" ? (
              <Button
                type="link"
                disabled
                label={item.id}
                style={{ paddingRight: 0 }}
              />
            ) : (
              <Button
                type="link"
                label={item.id}
                leftIcon={<IconUserInterfaceActionsShow />}
                href={`/onboarding/recap?spaceID=${item.id}&mode=admin`}
                style={{ paddingRight: 0 }}
              />
            )}
            <CopyIconButton text={item.id} />
          </Stack>
        </Cell>
        <Cell>
          <div>
            {DASHBOARD_ITEM_TYPES.find(
              ({ type, journey }) =>
                type === item.type && journey === item.journey,
            )?.textOne || "-"}
          </div>
        </Cell>
        <Cell>
          <div style={{ whiteSpace: "wrap", minWidth: "10rem" }}>
            {item.venue || "-"}
          </div>
        </Cell>
        <Cell>
          <div style={{ whiteSpace: "wrap", minWidth: "10rem" }}>
            {item.space || "-"}
          </div>
        </Cell>
        <Cell>
          <div style={{ whiteSpace: "wrap", minWidth: "10rem" }}>
            {item.pack || "-"}
          </div>
        </Cell>
        <Cell>
          <RinuCommission item={item} />
        </Cell>
        <Cell>
          <div>
            <StatusSelect item={item} />
          </div>
        </Cell>
        <Cell>
          <div>
            {formatDate(new Date(item.modifiedAt), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </Cell>
        <Cell>
          <Stack row gap="1rem" alignItems="center">
            <IconButton
              ariaLabel="Editar"
              icon={<IconUserInterfaceActionsEdit />}
              type="neutral"
              href={editHref}
              style={{ fontSize: "1rem" }}
            />
            <CreateButton item={item} />
            {item.type === "pack" && (
              <CopyPackButton
                pack={{ id: item.id, name: item.pack }}
                type="neutral"
              />
            )}
            <DeleteButton item={item} />
          </Stack>
        </Cell>
      </Row>
    </>
  );
};

const NoItems = () => <EmptyState text={{ subtitle: "Sem resultados" }} />;

const CreateButton = ({ item }: { item: DashboardItem }) => {
  const routerPush = useRouterPush();

  const {
    mutateAsync: createSpace,
    isPending: isPendingCreateSpace,
    isSuccess: isSuccessCreateSpace,
  } = useCreateSpace();

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const handleCreate = async () => {
    if (item.type === "venue") {
      const space = await createSpace({ venueID: item.id });
      routerPush(`/onboarding/space?spaceID=${space.id}`);
    } else if (item.type === "space") {
      const pack = await createPack({ spaceID: item.id });
      routerPush(`/onboarding/pack?packID=${pack.id}`);
    }
  };

  if (item.type === "pack") {
    return null;
  }

  return (
    <IconButton
      ariaLabel={item.type === "venue" ? "Criar espaço" : "Criar pack"}
      icon={<IconUserInterfaceActionsAdd />}
      type="neutral"
      onClick={handleCreate}
      style={{ fontSize: "1rem" }}
      disabled={
        isPendingCreateSpace ||
        isSuccessCreateSpace ||
        isPendingCreatePack ||
        isSuccessCreatePack
      }
    />
  );
};

const DeleteButton = ({ item }: { item: DashboardItem }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { mutateAsync: deletePack, isPending: isPendingDeletePack } =
    useDeletePack();

  const { mutateAsync: deleteSpace, isPending: isPendingDeleteSpace } =
    useDeleteSpace();

  const { mutateAsync: deleteVenue, isPending: isPendingDeleteVenue } =
    useDeleteVenue();

  const handleDelete = async () => {
    if (item.type === "venue") {
      await deleteVenue({ id: item.id });
    } else if (item.type === "space") {
      await deleteSpace({ id: item.id });
    } else {
      await deletePack({ id: item.id });
    }

    setIsConfirmModalOpen(false);
  };

  if (item.status !== "in_progress") {
    return null;
  }

  const label =
    item.type === "venue" ? "local" : item.type === "space" ? "espaço" : "pack";

  return (
    <>
      <IconButton
        ariaLabel="Eliminar"
        icon={<IconUserInterfaceActionsDelete />}
        type="neutral"
        onClick={() => setIsConfirmModalOpen(true)}
        style={{ fontSize: "1rem" }}
      />
      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        ariaLabel={`Eliminar ${label}`}
        width="medium"
      >
        <Stack gap="2.5rem">
          <TextBlock subtitle={`Deseja eliminar o ${label}?`} />
          <Stack gap="1rem">
            <Button
              label={`Eliminar ${label}`}
              type="red"
              onClick={handleDelete}
              loading={
                isPendingDeletePack ||
                isPendingDeleteSpace ||
                isPendingDeleteVenue
              }
            />
            <Button
              label="Cancelar"
              type="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default StatusTable;
