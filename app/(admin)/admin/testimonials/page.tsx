"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import EmptyState from "@/_components/EmptyState";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import IconUserInterfaceMiscellaneousRefresh from "@/_design_system/_icons/UserInterface/Miscellaneous/Refresh.svg";
import { useState } from "react";
import { useAdminTestimonials } from "@/_models/testimonial";
import TestimonialsTable from "./_components/TestimonialsTable";
import NewTestimonialModal from "./_components/NewTestimonialModal";
import ImportTestimonialsModal from "./_components/ImportTestimonialsModal";
import CircleLoader from "@/_design_system/CircleLoader";

export default function AdminTestimonials() {
  const { data: testimonials = [], isLoading } = useAdminTestimonials();

  const [isOpenNewModal, setIsOpenNewModal] = useState(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState(false);

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <Stack
          row
          justifyContent="space-between"
          alignItems="center"
          gap="1rem"
        >
          <TextBlock title="Testemunhos" />
          <Stack row gap="0.5rem">
            <Button
              label="Importar"
              leftIcon={<IconUserInterfaceMiscellaneousRefresh />}
              type="secondary"
              onClick={() => setIsOpenImportModal(true)}
            />
            <Button
              label="Criar"
              leftIcon={<IconUserInterfaceActionsAdd />}
              type="secondary"
              onClick={() => setIsOpenNewModal(true)}
            />
          </Stack>
          <NewTestimonialModal
            isOpen={isOpenNewModal}
            setIsOpen={setIsOpenNewModal}
          />
          <ImportTestimonialsModal
            isOpen={isOpenImportModal}
            setIsOpen={setIsOpenImportModal}
          />
        </Stack>
        {isLoading ? (
          <CircleLoader size={48} />
        ) : testimonials.length ? (
          <TestimonialsTable testimonials={testimonials} />
        ) : (
          <EmptyState
            text={{
              body: "Ainda não existem testemunhos. Crie um manualmente ou importe do Google.",
            }}
          />
        )}
      </Stack>
    </Stack>
  );
}
