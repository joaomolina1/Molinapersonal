"use client";

import IconUserInterfaceMiscellaneousRating from "@/_design_system/_icons/UserInterface/Miscellaneous/Rating.svg";
import IllustrationNoReviews from "@/_design_system/_illustrations/NoReviews.svg";
import Button, { IconButton, TextButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import PhotoGrid, { PhotoGridProps } from "@/_design_system/PhotoGrid";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import {
  getRatingCategory,
  Review,
  useDeleteReview,
  useReviews,
  useReviewsStats,
} from "@/_models/review";
import { Space } from "@/_models/space";
import { Venue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useCallback, useEffect, useState } from "react";
import PhotoCarousel from "../PhotoCarousel";
import Avatar from "@/_design_system/Avatar";
import NewReviewModal from "@/_components/NewReviewModal";
import { useSession } from "@/_services/session";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useSessionSearchParams } from "@/_components/Header";
import Pagination from "@/_design_system/Pagination";
import HiddenVenueName from "@/_components/HiddenVenueName";

const REVIEWS_PER_PAGE = 20;

const { block, element } = createBEMClasses("space-reviews");

const Reviews = ({ space, venue }: { space: Space; venue: Venue }) => {
  const isMobile = useMediaQuery("large");

  const [isOpenAllReviewsModal, setIsOpenAllReviewsModal] = useState(false);

  const { data: reviews = [] } = useReviews({
    entity: space.id,
    kind: "space",
    page: 1,
    page_size: REVIEWS_PER_PAGE,
  });

  const { data: reviewStats } = useReviewsStats({
    kind: "space",
    entity: space.id,
  });

  return (
    <Stack gap="1.5rem" className={block()}>
      <TextBlock
        label={isMobile ? "Avaliações" : undefined}
        subtitle={isMobile ? undefined : "Avaliações"}
      />
      {!!reviewStats && (
        <>
          {reviewStats.count === 0 && (
            <ReviewsEmptyState space={space} venue={venue} />
          )}
          {reviewStats.count > 0 && !!reviews.length && (
            <>
              <ReviewsSummary
                reviews={reviews}
                totalReviews={reviewStats.count}
                averageRating={reviewStats.average_rating}
                space={space}
                venue={venue}
              />
              {reviewStats.count > 1 && (
                <div className={element("list")}>
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      clampComment
                      onReadMore={() => setIsOpenAllReviewsModal(true)}
                    />
                  ))}
                </div>
              )}
              {reviewStats.count > 3 && (
                <div>
                  <Button
                    type="secondary"
                    label="Mostrar mais comentários"
                    onClick={() => setIsOpenAllReviewsModal(true)}
                  />
                </div>
              )}
              <AllReviewsModal
                isOpen={isOpenAllReviewsModal}
                setIsOpen={setIsOpenAllReviewsModal}
                reviewsForSummary={reviews}
                totalReviews={reviewStats.count}
                averageRating={reviewStats.average_rating}
                space={space}
                venue={venue}
              />
            </>
          )}
        </>
      )}
    </Stack>
  );
};

const ReviewsEmptyState = ({
  space,
  venue,
}: {
  space: Space;
  venue: Venue;
}) => {
  const [session] = useSession();

  return (
    <Stack gap="2.5rem" style={{ alignItems: "center", textAlign: "center" }}>
      <IllustrationNoReviews />
      {space.ownerID === session?.user_id ? (
        <TextBlock
          label={
            space.isServicesJourney
              ? "O seu serviço ainda não tem opiniões"
              : "O seu espaço ainda não tem opiniões"
          }
        />
      ) : (
        <TextBlock
          label="Seja o primeiro a escrever a sua opinião!"
          body="A sua opinião pode ajudar outras pessoas a tomar a melhor decisão para o seu evento."
        />
      )}
      <NewReviewButton space={space} venue={venue} />
    </Stack>
  );
};

const ReviewsSummary = ({
  reviews,
  totalReviews,
  averageRating,
  space,
  venue,
}: {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  space: Space;
  venue: Venue;
}) => {
  const isMobile = useMediaQuery("large");
  const [isOpenMobilePhotosModal, setIsOpenMobilePhotosModal] = useState(false);

  const reviewsWithPhotos = reviews.filter((review) => !!review.photos.length);

  return (
    <div className={element("summary")}>
      <Stack
        gap="1rem"
        className={element("summary__content")}
        alignItems="flex-start"
      >
        <Stack gap="0.5rem">
          <Stack row gap="1rem" alignItems="center">
            <span className={element("summary__avg")}>
              {averageRating.toFixed(1)}
            </span>
            <span className={element("summary__avg-label")}>
              {getRatingCategory(averageRating)}
            </span>
          </Stack>
          <ReviewStars rating={averageRating} />
        </Stack>
        <span className={element("summary__total")}>
          {totalReviews} {totalReviews === 1 ? "avaliação" : "avaliações"}
        </span>
        <NewReviewButton space={space} venue={venue} />
      </Stack>
      {totalReviews === 1 && <ReviewCard review={reviews[0]} largeOnDesktop />}
      {totalReviews > 1 && reviewsWithPhotos.length > 0 && (
        <>
          <PhotoGrid
            photos={reviewsWithPhotos.slice(0, 10).map((review) => ({
              gridURL: review.photos[0],
              modalURL: review.photos[0],
              listURL: review.photos[0],
            }))}
            label=""
            layout="grid-4"
            overlayMode="extra"
            className={element("summary__photos")}
            onClick={
              isMobile ? () => setIsOpenMobilePhotosModal(true) : undefined
            }
          />
          <MobilePhotosModal
            reviews={reviewsWithPhotos}
            isOpen={isOpenMobilePhotosModal}
            setIsOpen={setIsOpenMobilePhotosModal}
          />
        </>
      )}
    </div>
  );
};

const ReviewStars = ({ rating }: { rating: number }) => {
  return (
    <Stack
      row
      gap="0.5rem"
      className={element("stars")}
      aria-label={`${rating} estrelas`}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <IconUserInterfaceMiscellaneousRating
          key={index}
          filled={rating >= index}
        />
      ))}
    </Stack>
  );
};

const ReviewComment = ({
  comment,
  clampComment,
  onReadMore,
}: {
  comment: string;
  clampComment?: boolean;
  onReadMore?: () => void;
}) => {
  const [isClamped, setIsClamped] = useState(false);

  const ref = useCallback((node: HTMLParagraphElement) => {
    if (node !== null) {
      setIsClamped(node.scrollHeight > node.clientHeight);
    }
  }, []);

  return (
    <div>
      <p ref={ref} className={element("review__comment", { clampComment })}>
        {comment}
      </p>
      {isClamped && (
        <TextButton text="Ler mais" onClick={onReadMore} size="small" />
      )}
    </div>
  );
};

const ReviewCard = ({
  review,
  largeOnDesktop,
  clampComment,
  onReadMore,
}: {
  review: Review;
  largeOnDesktop?: boolean;
} & (
  | { clampComment?: false; onReadMore?: never }
  | { clampComment: true; onReadMore: () => void }
)) => {
  const isMobile = useMediaQuery("large");
  const [isOpenMobilePhotosModal, setIsOpenMobilePhotosModal] = useState(false);

  const layout: PhotoGridProps["layout"] =
    largeOnDesktop && !isMobile ? "row-4" : "grid-4";

  return (
    <div className={element("review", { largeOnDesktop })}>
      <header>
        <Stack gap="1rem">
          <ReviewCreationData review={review} />
          <Stack row gap="1rem" alignItems="center">
            <ReviewStars rating={review.rating} />
            <ReviewRating rating={review.rating} />
          </Stack>
        </Stack>
      </header>
      <main>
        <ReviewComment
          comment={review.comment}
          clampComment={clampComment}
          onReadMore={onReadMore}
        />
        {!!review.photos.length && (
          <>
            <PhotoGrid
              photos={review.photos.map((url) => ({
                gridURL: url,
                modalURL: url,
                listURL: url,
              }))}
              label=""
              layout={layout}
              onClick={
                isMobile ? () => setIsOpenMobilePhotosModal(true) : undefined
              }
              overlayMode="extra"
              className={element("review__photos", { layout })}
            />
            <MobilePhotosModal
              reviews={[review]}
              isOpen={isOpenMobilePhotosModal}
              setIsOpen={setIsOpenMobilePhotosModal}
            />
          </>
        )}
      </main>
      <DeleteReviewButton review={review} />
    </div>
  );
};

const AllReviewsModal = ({
  isOpen,
  setIsOpen,
  totalReviews,
  averageRating,
  space,
  venue,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reviewsForSummary: Review[];
  totalReviews: number;
  averageRating: number;
  space: Space;
  venue: Venue;
}) => {
  const [page, setPage] = useState(1);

  const { data: reviews = [] } = useReviews({
    entity: space.id,
    kind: "space",
    page,
    page_size: REVIEWS_PER_PAGE,
  });

  const numPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="xx-large"
      ariaLabel="Opiniões sobre o espaço"
      showCloseButton
    >
      <div className={element("all-reviews-modal")}>
        <header>
          <h1>
            Opiniões sobre {space.name}
            <HiddenVenueName
              name={` - ${venue.name}`}
              subscription={venue.subscription}
            />
          </h1>
          <ReviewsSummary
            reviews={reviews}
            totalReviews={totalReviews}
            averageRating={averageRating}
            space={space}
            venue={venue}
          />
        </header>
        <main>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} largeOnDesktop />
          ))}
          {numPages > 1 && (
            <Pagination page={page} setPage={setPage} numPages={numPages} />
          )}
        </main>
      </div>
    </Modal>
  );
};

const MobilePhotosModal = ({
  reviews,
  isOpen,
  setIsOpen,
}: {
  reviews: Review[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const photosWithReview = reviews.flatMap((review) =>
    review.photos.map((photo) => ({ photo, review })),
  );

  const [selected, setSelected] = useState(0);

  const selectedReview = photosWithReview[selected].review;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel="Fotografias das opiniões"
      contentStyle={{ paddingLeft: 0, paddingRight: 0 }}
      className={element("mobile-photos-modal")}
    >
      <Stack gap="1.5rem">
        <PhotoCarousel
          photoURLs={photosWithReview.map(({ photo }) => photo)}
          selected={selected}
          setSelected={setSelected}
        />
        <Stack gap="1.5rem" style={{ padding: "0 24px" }}>
          <div className={element("mobile-photos-modal__columns")}>
            <ReviewCreationData review={selectedReview} />
            <Stack gap="1rem">
              <ReviewRating rating={selectedReview.rating} />
              <ReviewStars rating={selectedReview.rating} />
            </Stack>
          </div>
          <Button
            label="Voltar às opiniões"
            type="link"
            onClick={() => setIsOpen(false)}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

const ReviewCreationData = ({ review }: { review: Review }) => {
  return (
    <Stack gap="0.25rem" style={{ flex: 1 }}>
      <Avatar name={review.ownerName} size="small" color="grey" />
      <span className={element("creation__name")}>{review.ownerName}</span>
      <span className={element("creation__date")}>
        Escrito a{" "}
        {formatDate(new Date(review.createdAt), { dateStyle: "medium" })}
      </span>
    </Stack>
  );
};

const ReviewRating = ({ rating }: { rating: number }) => {
  return <span className={element("rating")}>{rating}</span>;
};

const NewReviewButton = ({ space, venue }: { space: Space; venue: Venue }) => {
  const [session] = useSession();
  const [sessionSearchParams, setSessionSearchParams] =
    useSessionSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionSearchParams.source === "write-review") {
      if (session) {
        setIsOpen(true);
        setSessionSearchParams({
          action: null,
          source: null,
          otp: null,
          username: null,
        });
      } else if (!sessionSearchParams.action) {
        setSessionSearchParams({
          action: "login",
          source: "write-review",
          otp: null,
          username: null,
        });
      }
    }
  }, [
    session,
    sessionSearchParams.action,
    sessionSearchParams.source,
    setSessionSearchParams,
  ]);

  if (space.ownerID === session?.user_id) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        label="Escreva uma opinião"
        onClick={() => {
          if (session) {
            setIsOpen(true);
          } else {
            setSessionSearchParams({
              action: "login",
              source: "write-review",
              otp: null,
              username: null,
            });
          }
        }}
      />
      <NewReviewModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        space={space}
        venue={venue}
      />
    </>
  );
};

const DeleteReviewButton = ({ review }: { review: Review }) => {
  const [session] = useSession();
  const showToast = useShowToast();
  const [isOpen, setIsOpen] = useState(false);

  const {
    mutateAsync: deleteReview,
    isPending: isPendingDeleteReview,
    isError: isErrorDeleteReview,
    reset: resetDeleteReview,
  } = useDeleteReview();

  if (!session?.roles.includes("admin")) {
    return null;
  }

  const close = () => {
    resetDeleteReview();
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        icon={<IconUserInterfaceActionsDelete />}
        style={{ fontSize: "1rem" }}
        ariaLabel="Eliminar"
        showTooltip={false}
        onClick={() => setIsOpen(true)}
        className={element("review__delete")}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={close}
        ariaLabel="Eliminar local"
        width="small"
      >
        <Stack gap="2.5rem">
          <TextBlock subtitle="Deseja eliminar esta avaliação?" />
          <Stack gap="1rem">
            {isErrorDeleteReview && (
              <InputError error="Ocorreu um erro ao eliminar a avaliação" />
            )}
            <Button
              label="Eliminar"
              type="red"
              onClick={async () => {
                await deleteReview({ id: review.id });
                setIsOpen(false);
                showToast({ text: "Avaliação eliminada com sucesso" });
              }}
              loading={isPendingDeleteReview}
            />
            <Button label="Cancelar" type="secondary" onClick={close} />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default Reviews;
