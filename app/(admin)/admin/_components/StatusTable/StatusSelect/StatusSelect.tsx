"use client";

import { STATUSES, Status } from "@/_constants/status";
import { StylelessButton } from "@/_design_system/Button";
import Dropdown from "@/_design_system/InputSelect/Dropdown";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceMiscellaneousLoading from "@/_design_system/_icons/UserInterface/Miscellaneous/Loading.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { DashboardItem } from "@/_models/dashboard";
import { useUpdatePackStatus } from "@/_models/pack";
import { useUpdateSpaceStatus } from "@/_models/space";
import { useUpdateVenueStatus } from "@/_models/venue";
import { MenuTrigger, Popover } from "react-aria-components";

const statusOptions = STATUSES.map(({ id, label }) => ({ id, text: label }));

const StatusSelect = ({ item }: { item: DashboardItem }) => {
  const statusInfo = STATUSES.find(({ id }) => id === item.status);

  const {
    mutateAsync: updatePackStatus,
    isPending: isPendingUpdatePackStatus,
  } = useUpdatePackStatus();

  const {
    mutateAsync: updateSpaceStatus,
    isPending: isPendingUpdateSpaceStatus,
  } = useUpdateSpaceStatus();

  const {
    mutateAsync: updateVenueStatus,
    isPending: isPendingUpdateVenueStatus,
  } = useUpdateVenueStatus();

  const onClickOption = (status: Status) => {
    if (item.type === "pack") {
      updatePackStatus({ id: item.id, status });
    } else if (item.type === "space") {
      updateSpaceStatus({ id: item.id, status });
    } else if (item.type === "venue") {
      updateVenueStatus({ id: item.id, status });
    }
  };

  const isPending =
    isPendingUpdatePackStatus ||
    isPendingUpdateSpaceStatus ||
    isPendingUpdateVenueStatus;

  return (
    <MenuTrigger>
      <StylelessButton disabled={isPending}>
        {statusInfo &&
          (isPending ? (
            <Tag
              size="small"
              type="neutral"
              iconRight={<IconUserInterfaceMiscellaneousLoading />}
            />
          ) : (
            <Tag
              size="small"
              text={statusInfo.label}
              type={statusInfo.tagType}
              iconRight={<IconUserInterfaceNavigationArrowDown />}
            />
          ))}
      </StylelessButton>
      <Popover placement="bottom right" crossOffset={8}>
        <Dropdown
          ariaLabel="Opções de estado"
          options={statusOptions}
          value={item.status}
          onClickOption={onClickOption}
        />
      </Popover>
    </MenuTrigger>
  );
};

export default StatusSelect;
