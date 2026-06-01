"use client";

import { useHostStatus } from "@/_components/Header/useHostStatus";
import Button from "@/_design_system/Button";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";

const BecomeHostButton = () => {
  const hostStatus = useHostStatus();

  if (!hostStatus) {
    return null;
  }

  return (
    <Button
      type="primary"
      leftIcon={<IconUserInterfaceMiscellaneousVenues />}
      label={
        hostStatus.isAlreadyHost ? "A minha oferta" : "Registar como parceiro"
      }
      href={hostStatus.href}
      prefetch={false}
    />
  );
};

export default BecomeHostButton;
