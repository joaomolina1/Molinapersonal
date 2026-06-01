import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import CopyPackButton from "@/_components/CopyPackButton";
import Button, { IconButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import Tag from "@/_design_system/Tag";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { Pack, useDeletePack } from "@/_models/pack";
import { Space } from "@/_models/space";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";

const PacksTable = ({ packs, space }: { packs: Pack[]; space: Space }) => {
  const isMobile = useMediaQuery("large");

  if (isMobile) {
    return (
      <>
        {packs?.map((pack) => (
          <PackCard key={pack.id} pack={pack} space={space} />
        ))}
      </>
    );
  }

  return (
    <TableWrapper showTableBorder={false}>
      <Table ariaLabel="Packs" variant="borders">
        <TableHeader>
          <Column isRowHeader>ID</Column>
          <Column>Pack</Column>
          <Column>Estado</Column>
          <Column />
        </TableHeader>
        <TableBody>
          {packs?.map((pack) => (
            <PackRow key={pack.id} pack={pack} space={space} />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

const PackRow = ({ pack, space }: { pack: Pack; space: Space }) => {
  return (
    <Row>
      <Cell>
        <div>{pack.reference}</div>
      </Cell>
      <Cell>
        <div>{pack.name || "Sem nome"}</div>
      </Cell>
      <Cell>
        <div>
          <Tag
            size="small"
            text={pack.statusWording.label}
            type={pack.statusWording.tagType}
          />
        </div>
      </Cell>
      <Cell>
        <Stack row gap="1.5rem" justifyContent="center">
          {!space.isInProgress && (
            <IconButton
              ariaLabel={pack.isInProgress ? "Continuar" : "Editar"}
              icon={<IconUserInterfaceActionsEdit />}
              type="primary"
              href={`/onboarding/pack?packID=${pack.id}&spaceID=${space.id}`}
              style={{ fontSize: "1rem" }}
            />
          )}
          <CopyPackButton pack={pack} type="primary" />
          {pack.isInProgress && <DeletePackButton pack={pack} />}
        </Stack>
      </Cell>
    </Row>
  );
};

const PackCard = ({ pack, space }: { pack: Pack; space: Space }) => {
  return (
    <Stack className="host-pack-card" gap="0.5rem">
      <Stack row justifyContent="space-between" alignItems="flex-start">
        <ValueWithLabel
          label="Pack"
          value={`${pack.reference} - ${pack.name || "Sem nome"}`}
        />
        <Stack row gap="0.5rem" flexWrap="nowrap">
          {!space.isInProgress && (
            <IconButton
              icon={<IconUserInterfaceActionsEdit />}
              style={{ fontSize: "1rem" }}
              href={`/onboarding/pack?packID=${pack.id}&spaceID=${space.id}`}
              ariaLabel="Editar"
            />
          )}
          {pack.isInProgress && <DeletePackButton pack={pack} />}
        </Stack>
      </Stack>
      <ValueWithLabel
        label="Estado"
        value={
          <Tag
            size="small"
            text={pack.statusWording.label}
            type={pack.statusWording.tagType}
          />
        }
      />
    </Stack>
  );
};

const DeletePackButton = ({ pack }: { pack: Pack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("large");

  const { mutateAsync: deletePack, isPending: isPendingDeletePack } =
    useDeletePack();

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
        ariaLabel="Eliminar pack"
        width="medium"
      >
        <Stack gap="2.5rem">
          <TextBlock
            subtitle="Deseja eliminar o pack?"
            body="Depois de eliminado, não poderá ser recuperado."
          />
          <Stack gap="1rem">
            <Button
              label="Eliminar pack"
              type="red"
              onClick={async () => {
                await deletePack({ id: pack.id });
                setIsOpen(false);
              }}
              loading={isPendingDeletePack}
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

export default PacksTable;
