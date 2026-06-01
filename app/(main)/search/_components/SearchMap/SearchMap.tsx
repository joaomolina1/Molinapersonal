"use client";

import Modal from "@/_design_system/Modal";
import { useState } from "react";
import SearchMapContent from "./_components/SearchMapContent";
import { createBEMClasses } from "@/_utils/classname";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";

const { block: modalBlock, element: modalElement } =
  createBEMClasses("search-map-modal");

export const ModalSearchMap = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Ver mapa"
        type="secondary"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Mapa de resultados"
        mobileHeight="fullscreen"
        className={modalBlock()}
        showCloseButton={false}
      >
        <div className={modalElement("header")}>
          <IconButton
            ariaLabel="Fechar"
            icon={<IconUserInterfaceNavigationArrowLeft />}
            onClick={() => setIsOpen(false)}
          />
          <h6>Mapa</h6>
        </div>
        <SearchMapContent />
      </Modal>
    </>
  );
};

const { block: blockSidebar } = createBEMClasses("search-map-sidebar");

export const SidebarSearchMap = () => {
  return (
    <div className={blockSidebar()}>
      <SearchMapContent />
    </div>
  );
};
