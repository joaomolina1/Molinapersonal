import IconUserInterfaceMiscellaneousRating from "@/_design_system/_icons/UserInterface/Miscellaneous/Rating.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import Button, { StylelessButton } from "@/_design_system/Button";
import InputTextArea from "@/_design_system/InputTextArea";
import Modal from "@/_design_system/Modal";
import PhotoUpload from "@/_design_system/PhotoUpload";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import TextBlock from "@/_design_system/TextBlock";
import { useShowToast } from "@/_design_system/Toast";
import { Photo } from "@/_models/photo";
import { useCreateReview } from "@/_models/review";
import { Space } from "@/_models/space";
import { Venue } from "@/_models/venue";
import { useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import HiddenVenueName from "../HiddenVenueName";

const MAX_COMMENT_CHARS = 500;

const NewReviewModal = ({
  isOpen,
  setIsOpen,
  space,
  venue,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  space: Space;
  venue: Venue;
}) => {
  const [session] = useSession();
  const showToast = useShowToast();

  const {
    mutateAsync: createReview,
    isPending: isPendingCreateReview,
    isError: isErrorCreateReview,
  } = useCreateReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const closeAndReset = () => {
    setIsOpen(false);

    setRating(0);
    setComment("");
    setPhotos([]);
    setShowErrors(false);
  };

  const save = async () => {
    setShowErrors(true);

    if (!rating || !comment) {
      return;
    }

    await createReview({
      entity: space.id,
      kind: "space",
      rating,
      comment,
      photos: photos.map(({ id }) => id),
      name: session?.name ?? "",
    });

    closeAndReset();
    showToast({ text: "Avaliação submetida com sucesso" });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(newIsOpen) =>
        newIsOpen ? setIsOpen(true) : closeAndReset()
      }
      width="medium"
      ariaLabel="Deixar avaliação"
      showCloseButton={true}
    >
      <Stack gap="2rem">
        <TextBlock
          microtitle="Deixar avaliação"
          subtitle={
            <>
              Qual o seu grau de satisfação com a sua reserva no {space.name}
              <HiddenVenueName
                name={` - ${venue.name}`}
                subscription={venue.subscription}
              />
              ?
            </>
          }
          body="Partilhe a sua experiência com outras pessoas"
        />
        <Stack gap="1rem">
          <InputRating rating={rating} setRating={setRating} />
          {showErrors && !rating && (
            <InputError error="Por favor dê uma classificação de 1 a 5" />
          )}
        </Stack>
        <Stack gap="1rem">
          <TextBlock body="Deixe-nos o seu comentário:" />
          <InputTextArea
            value={comment}
            onChange={(value) =>
              value.length <= MAX_COMMENT_CHARS && setComment(value)
            }
            info={`${comment.length}/${MAX_COMMENT_CHARS}`}
            error={
              showErrors && !comment
                ? "Por favor escreva um comentário"
                : undefined
            }
            height="small"
          />
        </Stack>
        <Stack gap="1rem">
          <Stack row alignItems="center" gap="1rem">
            <TextBlock body="Adicione fotografias à sua opinião" />
            <Tag text="Opcional" size="small" border={false} type="neutral-2" />
          </Stack>
          <PhotoUpload
            photos={photos}
            onChangePhotos={setPhotos}
            max={20}
            minDimensions={{ width: 680, height: 480 }}
          />
        </Stack>
        {showErrors && isErrorCreateReview && (
          <InputError error="Ocorreu um erro ao submeter a avaliação" />
        )}
        <Stack gap="1rem">
          <Button
            type="primary"
            label="Submeter"
            onClick={save}
            loading={isPendingCreateReview}
          />
          <Button type="secondary" label="Cancelar" onClick={closeAndReset} />
        </Stack>
      </Stack>
    </Modal>
  );
};

const { block, element } = createBEMClasses("input-rating");

const InputRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  return (
    <div className={block()}>
      <div className={element("stars")}>
        {[1, 2, 3, 4, 5].map((index) => (
          <StylelessButton key={index} onClick={() => setRating(index)}>
            <IconUserInterfaceMiscellaneousRating filled={rating >= index} />
          </StylelessButton>
        ))}
      </div>
      <div className={element("labels")}>
        <span>Nada satisfeito</span>
        <span>Muito satisfeito</span>
      </div>
    </div>
  );
};

export default NewReviewModal;
