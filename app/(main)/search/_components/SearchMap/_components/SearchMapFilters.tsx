import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import { useState } from "react";
import SearchFiltersList from "../../SearchFilters/_components/SearchFiltersList";
import { createBEMClasses } from "@/_utils/classname";
import Counter from "@/_design_system/Counter";
import { useSearchContext } from "@/(main)/search/useSearchState";

const { block } = createBEMClasses("search-map-filters");

const SearchMapFilters = () => {
  const [isOpen, setIsOpen] = useState(false);

  const search = useSearchContext();
  const totalActive = search.attributes.length;

  return (
    <>
      <Button
        type="primary-inverted"
        label="Filtros"
        onClick={() => setIsOpen(true)}
        className={block()}
        rightIcon={
          totalActive > 0 ? <Counter value={totalActive} /> : undefined
        }
      />
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
              label="Aplicar"
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

export default SearchMapFilters;
