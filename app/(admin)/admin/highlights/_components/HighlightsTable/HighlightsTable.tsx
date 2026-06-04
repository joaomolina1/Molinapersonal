import { HighlightsList, HighlightWithRelations } from "../useHighlightsList";
import { IconButton } from "@/_design_system/Button";
import { formatDate } from "@/_utils/date";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { useState } from "react";
import NewHighlightModal from "../NewHighlightModal";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import CopyIconButton from "@/_components/CopyIconButton";
import Stack from "@/_design_system/Stack";

const HighlightsTable = ({
  highlightsList,
}: {
  highlightsList: HighlightsList;
}) => {
  const { highlights } = highlightsList;

  return (
    <TableWrapper>
      <Table ariaLabel="Destaques">
        <TableHeader>
          <Column isRowHeader>ID</Column>
          <Column>Local</Column>
          <Column>Espaço</Column>
          <Column>Zona</Column>
          <Column>Data início</Column>
          <Column>Data fim</Column>
          <Column>Prioridade</Column>
          <Column>Recomendado</Column>
          <Column>Plano</Column>
          <Column>Estado</Column>
          <Column />
        </TableHeader>
        <TableBody>
          {highlights.map((highlight, index) => (
            <HighlightRow
              key={highlight.id}
              highlight={highlight}
              odd={index % 2 === 1}
              modalSpaceOptions={highlightsList.modalSpaceOptions}
            />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

const HighlightRow = ({
  highlight,
  modalSpaceOptions,
  odd,
}: {
  highlight: HighlightWithRelations;
  modalSpaceOptions: HighlightsList["modalSpaceOptions"];
  odd: boolean;
}) => {
  const [isOpenEditHighlightModal, setIsOpenEditHighlightModal] =
    useState(false);

  return (
    <>
      <Row odd={odd}>
        <Cell>
          <div>
            <Stack row gap="0.25rem">
              {highlight.spaceID}
              <CopyIconButton text={highlight.spaceID} />
            </Stack>
          </div>
        </Cell>
        <Cell>
          <div>{highlight.venue?.name || "-"}</div>
        </Cell>
        <Cell>
          <div>{highlight.space?.name || "-"}</div>
        </Cell>
        <Cell>
          <div>{highlight.modeWording?.label || "-"}</div>
        </Cell>
        <Cell>
          <div>
            {[
              formatDate(highlight.fromDate, { day: "numeric" }),
              formatDate(highlight.fromDate, { month: "short" }).slice(0, -1),
              formatDate(highlight.fromDate, { year: "numeric" }),
            ].join(" ")}
          </div>
        </Cell>
        <Cell>
          <div>
            {[
              formatDate(highlight.toDate, { day: "numeric" }),
              formatDate(highlight.toDate, { month: "short" }).slice(0, -1),
              formatDate(highlight.toDate, { year: "numeric" }),
            ].join(" ")}
          </div>
        </Cell>
        <Cell>
          <div>{highlight.priority}</div>
        </Cell>
        <Cell>
          <div>
            {highlight.recommended ? (
              <IconUserInterfaceActionsCheck />
            ) : (
              <IconUserInterfaceActionsClose />
            )}
          </div>
        </Cell>
        <Cell>
          <div>
            {highlight.plan ? (
              <Tag
                size="small"
                text={highlight.plan === "expert" ? "Expert" : "Premium"}
                type={highlight.plan === "expert" ? "success" : "info"}
              />
            ) : (
              "-"
            )}
          </div>
        </Cell>
        <Cell>
          <div>
            <Tag
              size="small"
              text={highlight.statusWording?.label}
              type={highlight.statusWording?.tagType}
            />
          </div>
        </Cell>
        <Cell>
          <div>
            <IconButton
              ariaLabel="Editar"
              icon={<IconUserInterfaceActionsEdit />}
              type="primary"
              onClick={() => setIsOpenEditHighlightModal(true)}
            />
            <NewHighlightModal
              isOpen={isOpenEditHighlightModal}
              setIsOpen={setIsOpenEditHighlightModal}
              initialHighlight={highlight}
              modalSpaceOptions={modalSpaceOptions}
            />
          </div>
        </Cell>
      </Row>
    </>
  );
};

export default HighlightsTable;
