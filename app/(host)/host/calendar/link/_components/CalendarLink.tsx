import { ICAL_IMPORT_STATUS } from "@/_constants/ical/status";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import IconUserInterfaceActionsCopy from "@/_design_system/_icons/UserInterface/Actions/Copy.svg";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceMiscellaneousRefresh from "@/_design_system/_icons/UserInterface/Miscellaneous/Refresh.svg";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import Alert from "@/_design_system/Alert";
import Button, { IconButton, TextButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
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
import { useShowToast } from "@/_design_system/Toast";
import ToggleButton from "@/_design_system/ToggleButton";
import {
  SpaceIcals,
  useCreateExportIcal,
  useDeleteImportIcal,
  useEnableExportIcal,
  useRefreshImportIcals,
  useSpaceIcals,
} from "@/_models/ical";
import { Space } from "@/_models/space";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useEffect, useState } from "react";
import NewCalendarLinkModal from "./NewCalendarLinkModal";
import config from "@/_utils/config";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";

const { block, element } = createBEMClasses("calendar-link");

const CalendarLink = ({ space }: { space: Space }) => {
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const { data: icals, isPending } = useSpaceIcals(space.id, {
    refetchInterval: lastSync ? 5000 : undefined,
  });

  useEffect(() => {
    if (lastSync) {
      const hasLaterSync = !!icals?.imports.find(
        (importCalendar) =>
          !!importCalendar.lastSync &&
          new Date(importCalendar.lastSync) >= lastSync,
      );

      if (hasLaterSync) {
        setLastSync(null);
      }
    }
  }, [icals?.imports, lastSync]);

  if (isPending) {
    return;
  }

  return (
    <Stack className={block()} gap="1rem">
      <h4>{space.name}</h4>
      <ExportCalendar ical={icals?.exports[0]} space={space} />
      <hr />
      <ImportCalendars
        icals={icals?.imports ?? []}
        space={space}
        isSyncInProgress={!!lastSync}
        onImport={() => setLastSync(new Date())}
      />
    </Stack>
  );
};

const ExportCalendar = ({
  ical,
  space,
}: {
  ical?: SpaceIcals["exports"][number];
  space: Space;
}) => {
  const isMobile = useMediaQuery("small");
  const showToast = useShowToast();

  const { mutateAsync: enableIcal, isPending: isPendingEnableIcal } =
    useEnableExportIcal();

  const { mutateAsync: createIcal, isPending: isPendingCreateIcal } =
    useCreateExportIcal();

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!ical && enabled) {
      await createIcal({ space: space.id });
      showToast({
        text: "Exportação do calendário activada com sucesso",
      });
      return;
    }

    if (ical) {
      await enableIcal({ id: ical.id, spaceID: space.id, enabled });
      showToast({
        text: enabled
          ? "Exportação do calendário activada com sucesso"
          : "Exportação do calendário desactivada com sucesso",
      });
      return;
    }
  };

  const url = `${config.apiUrl}${ical?.path}`;

  return (
    <Stack className={element("export")} gap="0.5rem">
      <h6>Exportar calendário</h6>
      <p>
        Utilize este endereço para aceder a este calendário a partir de outras
        aplicações.
      </p>
      <Alert
        icon={<IconUserInterfaceMiscellaneousInfo />}
        text={
          <>
            A sincronização em aplicações externas pode levar algumas horas e
            pode variar de uma aplicação para outra. A Google, por exemplo,
            atualiza normalmente de 8 em 8 horas, ou seja, um evento criado na
            RINU pode demorar até 8 horas a sincronizar no seu calendário
            Google. Veja aqui as instruções para importar o seu calendário RINU
            em{" "}
            <TextButton
              text="Google Calendar"
              target="_blank"
              href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop"
              size={isMobile ? "x-small" : "small"}
            />{" "}
            ou em{" "}
            <TextButton
              text="Outlook"
              target="_blank"
              href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379"
              size={isMobile ? "x-small" : "small"}
            />
            .
          </>
        }
        variant="neutral-2"
      />
      <Stack
        row={!isMobile}
        gap={isMobile ? "0.5rem" : "1rem"}
        alignItems={isMobile ? "stretch" : "center"}
      >
        <Stack
          row
          gap="1rem"
          alignItems="center"
          className={element("export__toggle")}
        >
          <span>Disponibilizar publicamente</span>
          <ToggleButton
            selected={ical?.enabled ?? false}
            ariaLabel="Disponibilizar publicamente"
            size="medium"
            onChange={handleToggleEnabled}
            disabled={isPendingEnableIcal || isPendingCreateIcal}
          />
        </Stack>
        {!!ical && (
          <InputText
            label="Endereço público em formato iCal"
            value={url}
            rightIcon={
              <IconButton
                ariaLabel="Copiar"
                icon={<IconUserInterfaceActionsCopy />}
                style={{ fontSize: "1.25rem" }}
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  showToast({
                    text: "Endereço copiado para a área de transferência",
                  });
                }}
              />
            }
            className={element("export__link")}
          />
        )}
      </Stack>
    </Stack>
  );
};

const ImportCalendars = ({
  icals,
  space,
  isSyncInProgress,
  onImport,
}: {
  icals: SpaceIcals["imports"];
  space: Space;
  isSyncInProgress: boolean;
  onImport: () => void;
}) => {
  const isMobile = useMediaQuery("small");

  const [isOpenNewCalendarLinkModal, setIsOpenNewCalendarLinkModal] =
    useState(false);

  const { mutateAsync: refreshIcals, isPending: isPendingRefreshIcals } =
    useRefreshImportIcals();

  return (
    <Stack className={element("import")} gap="0.5rem">
      <h6>Calendários importados</h6>
      <p>
        Importe reservas de outras plataformas para a RINU através da
        sincronização de calendários.
      </p>
      <Alert
        icon={<IconUserInterfaceMiscellaneousInfo />}
        text={
          <>
            O iCal é um sistema global que permite sincronizar calendários de
            aplicações diferentes. Para sincronizar um calendário Google ou
            Outlook com a RINU, terá que obter o Link respetivo e garantir que
            os calendários estão públicos. Veja aqui as instruções{" "}
            <TextButton
              text="Google"
              target="_blank"
              href="https://www.souladvisor.com/help-centre/how-to-get-outlook-calendar-address-in-ical-format"
              size={isMobile ? "x-small" : "small"}
            />{" "}
            e as instruções{" "}
            <TextButton
              text="Outlook"
              target="_blank"
              href="https://support.google.com/calendar/answer/99358?hl=en&co=GENIE.Platform%3DiOS"
              size={isMobile ? "x-small" : "small"}
            />
            .
          </>
        }
        variant="neutral-2"
      />
      {!!icals.length && (
        <>
          <TableWrapper>
            <Table ariaLabel="Calendários sincronizados">
              <TableHeader>
                <Column isRowHeader>Nome</Column>
                <Column>Última importação</Column>
                <Column>Estado</Column>
                <Column />
              </TableHeader>
              <TableBody>
                {icals.map((ical, index) => (
                  <ImportCalendarRow
                    key={ical.id}
                    ical={ical}
                    space={space}
                    odd={index % 2 === 1}
                  />
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            text="O sistema atualiza automaticamente de 2 em 2 horas, mas pode atualizá-lo manualmente sempre que quiser."
          />
        </>
      )}
      <Stack row={!isMobile} gap={isMobile ? "0.5rem" : "1rem"}>
        <Button
          type="primary"
          leftIcon={<IconUserInterfaceActionsAdd />}
          label="Adicionar ligação"
          onClick={() => setIsOpenNewCalendarLinkModal(true)}
        />
        {!!icals.length && (
          <Button
            type="secondary"
            leftIcon={<IconUserInterfaceMiscellaneousRefresh />}
            label="Atualizar tudo"
            onClick={async () => {
              await refreshIcals({ spaceID: space.id });
              onImport();
            }}
            loading={isPendingRefreshIcals || isSyncInProgress}
          />
        )}
        <NewCalendarLinkModal
          isOpen={isOpenNewCalendarLinkModal}
          setIsOpen={setIsOpenNewCalendarLinkModal}
          space={space}
          onImport={onImport}
        />
      </Stack>
    </Stack>
  );
};

const ImportCalendarRow = ({
  ical,
  space,
  odd,
}: {
  ical: SpaceIcals["imports"][number];
  space: Space;
  odd: boolean;
}) => {
  const showToast = useShowToast();

  const { mutateAsync: deleteIcal, isPending: isPendingDeleteIcal } =
    useDeleteImportIcal();

  const handleDelete = async () => {
    await deleteIcal({ id: ical.id, spaceID: space.id });
    showToast({
      text: `Calendário ${ical.name} removido com sucesso`,
    });
  };

  const status = ICAL_IMPORT_STATUS.find(({ id }) => id === ical.status);

  return (
    <Row odd={odd}>
      <Cell style={{ width: "100%" }}>
        <div>{ical.name}</div>
      </Cell>
      <Cell>
        <div>
          {ical.lastSync
            ? formatDate(new Date(ical.lastSync), {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "-"}
        </div>
      </Cell>
      <Cell>
        <div>
          {!!status && (
            <Tag text={status.label} type={status.tagType} size="small" />
          )}
        </div>
      </Cell>
      <Cell style={{ paddingInline: 8 }}>
        <div>
          <Button
            type="link"
            leftIcon={<IconUserInterfaceActionsDelete />}
            label="Remover"
            loading={isPendingDeleteIcal}
            onClick={handleDelete}
          />
        </div>
      </Cell>
    </Row>
  );
};

export default CalendarLink;
