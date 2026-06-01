"use client";

import Chip from "@/_design_system/Chip";
import Modal from "@/_design_system/Modal";
import { useState } from "react";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsFilters from "@/_design_system/_icons/UserInterface/Actions/Filters.svg";
import Button, { SquareButton } from "@/_design_system/Button";
import SearchFiltersList from "./_components/SearchFiltersList";
import Counter from "@/_design_system/Counter";
import { useSearchContext } from "../../useSearchState";
import { useMediaQuery } from "@/_utils/mediaQuery";

export const ModalSearchFilters = () => {
  const isMobile = useMediaQuery("large");
  const [isOpen, setIsOpen] = useState(false);

  const search = useSearchContext();
  const totalActive = search.attributes.length;

  return (
    <>
      {isMobile ? (
        <SquareButton
          ariaLabel="Filtrar"
          icon={<IconUserInterfaceActionsFilters />}
          counter={
            totalActive > 0 ? <Counter value={totalActive} /> : undefined
          }
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <Chip
          type="button"
          leftIcon={<IconUserInterfaceActionsFilters />}
          label="Filtrar"
          rightIcon={
            totalActive > 0 ? <Counter value={totalActive} /> : undefined
          }
          onClick={() => setIsOpen(true)}
        />
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Filtros de pesquisa"
        label="Filtros"
        footer={
          <Stack row justifyContent="space-between">
            <Button
              label="Limpar filtros"
              type="link"
              onClick={() => {
                search.setAttributes([]);
                setIsOpen(false);
              }}
            />
            <Button
              label="Ver resultados"
              type="primary"
              onClick={() => setIsOpen(false)}
            />
          </Stack>
        }
      >
        <SearchFiltersList />
      </Modal>
    </>
  );
};
