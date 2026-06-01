"use client";

import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { Button as AriaButton } from "react-aria-components";
import Modal from "@/_design_system/Modal";
import { useState } from "react";
import { HeroSearch } from "@/(main)/_components/HeroBanner/HeroSearch";

const { block: triggerBlock, element: triggerElement } = createBEMClasses(
  "hero-search-modal-trigger",
);

const { block: modalBlock } = createBEMClasses("hero-search-modal");

export const HeroSearchModal = ({
  closeDrawer,
}: {
  closeDrawer: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AriaButton className={triggerBlock()} onPress={() => setIsOpen(true)}>
        <p className={triggerElement("info-main")}>O que está a planear?</p>
        <Stack row alignItems="center" className={triggerElement("info-other")}>
          <span>Indique algumas informações para iniciar a pesquisa</span>
        </Stack>
      </AriaButton>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Pesquisa"
        className={modalBlock()}
        width="medium"
        mobileHeight="almost-fullscreen"
      >
        <HeroSearch
          mode="modal"
          onSearchDone={() => {
            setIsOpen(false);
            closeDrawer();
          }}
        />
      </Modal>
    </>
  );
};
