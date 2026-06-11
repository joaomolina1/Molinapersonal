import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import InputText from "@/_design_system/InputText";
import InputTextArea from "@/_design_system/InputTextArea";
import InputNumber from "@/_design_system/InputNumber";
import InputSelect from "@/_design_system/InputSelect";
import InputCheckbox from "@/_design_system/InputCheckbox";
import Button from "@/_design_system/Button";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useState } from "react";
import {
  Testimonial,
  useCreateTestimonial,
  useUpdateTestimonial,
} from "@/_models/testimonial";

type NewTestimonialModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialTestimonial?: Testimonial;
};

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((rating) => ({
  id: String(rating),
  text: `${rating} ★`,
}));

const NewTestimonialModal = (props: NewTestimonialModalProps) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.setIsOpen}
      width="x-large"
      ariaLabel={
        props.initialTestimonial ? "Editar testemunho" : "Criar testemunho"
      }
    >
      <NewTestimonialModalContent {...props} />
    </Modal>
  );
};

const NewTestimonialModalContent = ({
  setIsOpen,
  initialTestimonial,
}: NewTestimonialModalProps) => {
  const [authorName, setAuthorName] = useState(
    initialTestimonial?.authorName ?? "",
  );
  const [authorDetail, setAuthorDetail] = useState(
    initialTestimonial?.authorDetail ?? "",
  );
  const [text, setText] = useState(initialTestimonial?.text ?? "");
  const [rating, setRating] = useState<string | undefined>(
    initialTestimonial?.rating ? String(initialTestimonial.rating) : "5",
  );
  const [priority, setPriority] = useState<number | undefined>(
    initialTestimonial?.priority ?? 0,
  );
  const [published, setPublished] = useState(
    initialTestimonial?.published ?? true,
  );

  const [showErrors, setShowErrors] = useState(false);

  const {
    mutateAsync: createTestimonial,
    isPending: isPendingCreate,
    isError: isErrorCreate,
  } = useCreateTestimonial();
  const {
    mutateAsync: updateTestimonial,
    isPending: isPendingUpdate,
    isError: isErrorUpdate,
  } = useUpdateTestimonial();

  const showToast = useShowToast();

  const save = async () => {
    setShowErrors(true);

    if (!authorName.trim() || !text.trim()) {
      return;
    }

    const body = {
      authorName: authorName.trim(),
      authorDetail: authorDetail.trim() || null,
      text: text.trim(),
      rating: rating ? Number(rating) : null,
      photoURL: initialTestimonial?.photoURL ?? null,
      published,
      priority: priority ?? 0,
    };

    if (initialTestimonial) {
      await updateTestimonial({ id: initialTestimonial.id, body });
    } else {
      await createTestimonial(body);
    }

    setIsOpen(false);
    showToast({
      text: initialTestimonial
        ? "Testemunho editado com sucesso"
        : "Testemunho criado com sucesso",
    });
  };

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <StackHalfHalf gap="1rem">
          <InputText
            value={authorName}
            onChange={setAuthorName}
            label="Nome do autor"
            invalid={showErrors && !authorName.trim()}
          />
          <InputText
            value={authorDetail}
            onChange={setAuthorDetail}
            label="Detalhe (ex: Evento de empresa · Lisboa)"
            showLabelOptional
          />
        </StackHalfHalf>
        <InputTextArea
          value={text}
          onChange={setText}
          label="Testemunho"
          invalid={showErrors && !text.trim()}
        />
        <StackHalfHalf gap="1rem">
          <InputSelect
            value={rating}
            onChange={setRating}
            label="Avaliação"
            options={RATING_OPTIONS}
          />
          <InputNumber
            value={priority}
            onChange={setPriority}
            label="Prioridade"
            allowNegative={false}
            decimalScale={0}
          />
        </StackHalfHalf>
        <StackHalfHalf gap="1rem" rightEmpty>
          <InputCheckbox
            checked={published}
            onChange={setPublished}
            label="Publicado"
            position="right"
          />
        </StackHalfHalf>
        {showErrors && (isErrorCreate || isErrorUpdate) && (
          <InputError error="Ocorreu um erro ao guardar o testemunho" />
        )}
      </Stack>
      <Stack gap="1rem">
        <Button
          type="primary"
          label="Guardar"
          loading={isPendingCreate || isPendingUpdate}
          onClick={save}
        />
        <Button
          type="secondary"
          label="Cancelar"
          onClick={() => setIsOpen(false)}
        />
      </Stack>
    </Stack>
  );
};

export default NewTestimonialModal;
