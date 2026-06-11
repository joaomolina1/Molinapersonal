import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import InputText from "@/_design_system/InputText";
import InputTextArea from "@/_design_system/InputTextArea";
import Button from "@/_design_system/Button";
import Alert from "@/_design_system/Alert";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useState } from "react";
import {
  useImportBulkTestimonials,
  useImportGoogleTestimonials,
} from "@/_models/testimonial";

type ImportTestimonialsModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ImportTestimonialsModal = (props: ImportTestimonialsModalProps) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.setIsOpen}
      width="x-large"
      ariaLabel="Importar testemunhos"
    >
      <ImportTestimonialsModalContent {...props} />
    </Modal>
  );
};

const ImportTestimonialsModalContent = ({
  setIsOpen,
}: ImportTestimonialsModalProps) => {
  const showToast = useShowToast();

  const [googleInput, setGoogleInput] = useState("");
  const {
    mutateAsync: importGoogle,
    isPending: isPendingGoogle,
  } = useImportGoogleTestimonials();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [bulkInput, setBulkInput] = useState("");
  const {
    mutateAsync: importBulk,
    isPending: isPendingBulk,
  } = useImportBulkTestimonials();
  const [bulkError, setBulkError] = useState<string | null>(null);

  const runGoogleImport = async () => {
    setGoogleError(null);
    if (!googleInput.trim()) {
      setGoogleError("Indique o Place ID ou o nome do local no Google Maps");
      return;
    }
    try {
      const result = await importGoogle({ input: googleInput.trim() });
      showToast({
        text: `${result.placeName}: ${result.imported} importados, ${result.skipped} já existentes`,
      });
      setGoogleInput("");
    } catch (e: any) {
      const match = String(e?.message ?? "").match(/\{.*\}/);
      let message = "Erro ao importar do Google";
      if (match) {
        try {
          message = JSON.parse(match[0]).error ?? message;
        } catch {
          // keep default message
        }
      }
      setGoogleError(message);
    }
  };

  const runBulkImport = async () => {
    setBulkError(null);
    let items: unknown;
    try {
      items = JSON.parse(bulkInput);
    } catch {
      setBulkError("JSON inválido. Cole uma lista: [{...}, {...}]");
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      setBulkError("Cole uma lista JSON com pelo menos um testemunho");
      return;
    }
    try {
      const result = await importBulk({ items });
      showToast({
        text: `${result.imported} importados, ${result.skipped} ignorados (duplicados ou inválidos)`,
      });
      setBulkInput("");
    } catch {
      setBulkError("Erro ao importar a lista");
    }
  };

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <TextBlock
          subtitle="Importar do Google"
          body="Indique o Place ID ou o nome do local. A API do Google devolve no máximo as 5 reviews mais recentes por local — repita a importação periodicamente para acumular (os duplicados são ignorados)."
        />
        <InputText
          value={googleInput}
          onChange={setGoogleInput}
          label="Place ID ou nome do local (ex: RINU Lisboa)"
        />
        {googleError && <InputError error={googleError} />}
        <Button
          type="primary"
          label="Importar do Google"
          loading={isPendingGoogle}
          onClick={runGoogleImport}
        />
      </Stack>
      <Stack gap="1rem">
        <TextBlock
          subtitle="Importar em massa (JSON)"
          body="Para importar reviews em escala, cole uma lista JSON. Aceita o formato da API do Google (author_name, rating, text, time) ou o formato simples (authorName, rating, text)."
        />
        <Alert text='Exemplo: [{"authorName": "Maria S.", "rating": 5, "text": "Evento fantástico!"}]' />
        <InputTextArea
          value={bulkInput}
          onChange={setBulkInput}
          label="Lista JSON"
        />
        {bulkError && <InputError error={bulkError} />}
        <Button
          type="primary"
          label="Importar lista"
          loading={isPendingBulk}
          onClick={runBulkImport}
        />
      </Stack>
      <Button
        type="secondary"
        label="Fechar"
        onClick={() => setIsOpen(false)}
      />
    </Stack>
  );
};

export default ImportTestimonialsModal;
