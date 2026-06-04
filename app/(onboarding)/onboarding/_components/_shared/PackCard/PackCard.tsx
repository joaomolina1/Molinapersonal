import { AmenitiesList } from "@/_design_system/AmenitiesItem";
import Button, { IconButton } from "@/_design_system/Button";
import Callout from "@/_design_system/Callout";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import IconUserInterfaceNavigationMenuVertical from "@/_design_system/_icons/UserInterface/Navigation/MenuVertical.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { Pack, useCreatePackCopy, useDeletePack } from "@/_models/pack";
import { useAttachments } from "@/_models/attachment";
import { createBEMClasses } from "@/_utils/classname";
import { isNotNil } from "@/_utils/filter";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { formatMoney } from "@/_utils/number";
import { MenuTrigger, Popover } from "react-aria-components";
import { useSession } from "@/_services/session";
import PackCardAdminModal from "./PackCardAdminModal";
import { useRouterPush } from "@/_services/navigation";
import IconUserInterfaceActionsCopy from "@/_design_system/_icons/UserInterface/Actions/Copy.svg";

const { block, element } = createBEMClasses("onboarding-pack-card");

const PackCard = ({
  pack,
  showStatus,
  enableEdit,
  error,
}: {
  pack: Pack;
  showStatus?: boolean;
  enableEdit?: boolean;
  error?: string;
}) => {
  const routerPush = useRouterPush();
  const isMobile = useMediaQuery("large");
  const [session] = useSession();

  const isAdmin = session?.roles.includes("admin");

  const editPackUrl = `/onboarding/pack?packID=${pack.id}`;

  const { mutateAsync: deletePack, isPending: isPendingDeletePack } =
    useDeletePack();

  const { mutateAsync: createPackCopy, isPending: isPendingCreatePackCopy } =
    useCreatePackCopy();

  const handleDelete = async () => {
    await deletePack({ id: pack.id });
  };

  const handleCreateCopy = async () => {
    await createPackCopy({ id: pack.id });
  };

  const handleCalloutOptionClick = async (id: PackCalloutOption) => {
    if (id === "edit") {
      routerPush(editPackUrl);
    } else if (id === "copy") {
      await handleCreateCopy();
    } else if (id === "delete") {
      await handleDelete();
    }
  };

  const minimumPrice = Math.min(
    ...pack.prices.flatMap((price) =>
      price.schedules.map(
        (schedule) => schedule.valueHour + schedule.valuePerson,
      ),
    ),
  );

  const { data: attachments = [] } = useAttachments(
    pack.attachmentIDs?.length ? pack.attachmentIDs : undefined,
  );

  return (
    <Stack gap="1rem" className={block()}>
      {!!error && <InputError error={error} />}
      <Stack
        row
        gap="2.5rem"
        alignItems="center"
        justifyContent="space-between"
      >
        {!isMobile && attachments.length > 0 && (
          <div className={element("attachments")}>
            <p className={element("attachments__count")}>
              {attachments.length}{" "}
              {attachments.length === 1 ? "anexo" : "anexos"}
            </p>
            <ul className={element("attachments__list")}>
              {attachments.slice(0, 3).map((attachment) => (
                <li key={attachment.id} className={element("attachments__item")}>
                  {attachment.filename}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Stack gap="1rem" style={{ flex: 1, alignSelf: "flex-start" }}>
          <Stack
            row
            gap="1rem"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack
              row={!isMobile}
              gap="1rem"
              alignItems={isMobile ? "flex-start" : "center"}
            >
              <h5>{pack.name || "Sem nome"}</h5>
              {showStatus && (
                <Tag
                  size="small"
                  text={pack.statusWording.label}
                  type={pack.statusWording.tagType}
                />
              )}
            </Stack>
            {isMobile && enableEdit && (
              <Tooltip content="Ver opções">
                <MenuTrigger>
                  <IconButton
                    ariaLabel="Ver opções"
                    icon={<IconUserInterfaceNavigationMenuVertical />}
                    style={{ fontSize: "1.25rem" }}
                    showTooltip={false}
                  />
                  <Popover placement="bottom right" crossOffset={20}>
                    <Callout
                      ariaLabel="Opções do menu de pack"
                      options={packCalloutOptions}
                      onClickOption={handleCalloutOptionClick}
                    />
                  </Popover>
                </MenuTrigger>
              </Tooltip>
            )}
          </Stack>
          <div className={element("notice-price")}>
            {isNotNil(pack.noticeDays) && (
              <p>
                {pack.noticeDays} {pack.noticeDays === 1 ? "dia" : "dias"} para
                preparar a reserva
              </p>
            )}
            {pack.prices.length > 0 && (
              <>
                {!isMobile && <IconUserInterfaceMiscellaneousSeparatorDot />}
                <p>Desde {formatMoney(minimumPrice)}</p>
              </>
            )}
          </div>
          <p className={element("description")}>
            {pack.description || "Sem descrição"}
          </p>
          {!!pack.featureAttributes.length && (
            <AmenitiesList
              items={pack.featureAttributes.map(({ icon, label }) => ({
                icon,
                label,
              }))}
            />
          )}
          {!!pack.serviceTypeFeatureAttributes.length && (
            <AmenitiesList items={pack.serviceTypeFeatureAttributes} />
          )}
          {!!pack.extras && (
            <div className={element("extras")}>
              <p className={element("extras__title")}>Serviços adicionais</p>
              {pack.extras.map((extra) => (
                <p key={extra.id} className={element("extras__item")}>
                  {extra.description}
                </p>
              ))}
            </div>
          )}
          {isAdmin && <PackCardAdminModal pack={pack} />}
        </Stack>
        {!isMobile && (
          <Stack gap="1.5rem">
            <Button
              type="link"
              label="Editar"
              leftIcon={<IconUserInterfaceActionsEdit />}
              href={editPackUrl}
              disabled={!enableEdit}
            />
            <div className={element("hr")} />
            <Button
              type="link"
              label="Duplicar"
              leftIcon={<IconUserInterfaceActionsCopy />}
              onClick={handleCreateCopy}
              loading={isPendingCreatePackCopy}
              disabled={!enableEdit}
            />
            <div className={element("hr")} />
            <Button
              type="link"
              label="Eliminar"
              leftIcon={<IconUserInterfaceActionsDelete />}
              onClick={handleDelete}
              loading={isPendingDeletePack}
              disabled={!enableEdit}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

const packCalloutOptions = [
  {
    id: "edit",
    icon: <IconUserInterfaceActionsEdit />,
    text: "Editar",
  },
  {
    id: "copy",
    icon: <IconUserInterfaceActionsCopy />,
    text: "Duplicar",
  },
  {
    id: "delete",
    icon: <IconUserInterfaceActionsDelete />,
    text: "Eliminar",
  },
] as const;

type PackCalloutOption = (typeof packCalloutOptions)[number]["id"];

export default PackCard;
