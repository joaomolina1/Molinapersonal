import { IconButton } from "@/_design_system/Button";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousTooltip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tooltip.svg";

const ExtraFieldTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} visibleOnTouchDevice openOnlyOnClick>
    <IconButton
      showTooltip={false}
      ariaLabel="Mais informação"
      icon={<IconUserInterfaceMiscellaneousTooltip />}
    />
  </Tooltip>
);

export const EXTRA_DEFAULT_HOUR_TOOLTIP =
  "Coloque aqui o número de horas que aparecem ao cliente por default para este extra. Por exemplo, um evento pode ter uma duração de 8h mas se o extra for de DJ pode ter um número inferior. Caso o campo não seja preenchido, a plataforma irá utilizar o nº de horas do evento para cotar este extra. No caso do nº de horas default ser superior ao nº de horas totais do evento, a plataforma irá utilizar também o nº de horas do evento";

export const EXTRA_DEFAULT_PAX_TOOLTIP =
  "Coloque aqui o número de pessoas que aparecem ao cliente por default para este extra. Por exemplo, um extra de dormida pode ser apenas para um número de pessoas muito inferior ao nº de pessoas que irá comparecer ao evento. Caso o campo não seja preenchido, a plataforma irá utilizar o nº de pessoas do evento para cotar este extra. No caso do nº de pessoas default ser superior ao nº de pessoas totais do evento, a plataforma irá utilizar também o nº de pessoas do evento";

export default ExtraFieldTooltip;
