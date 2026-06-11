import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import Tag from "@/_design_system/Tag";
import { useState } from "react";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import {
  Testimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from "@/_models/testimonial";
import NewTestimonialModal from "../NewTestimonialModal";
import { useShowToast } from "@/_design_system/Toast";
import { formatDate } from "@/_utils/date";

const TestimonialsTable = ({
  testimonials,
}: {
  testimonials: Testimonial[];
}) => {
  return (
    <TableWrapper>
      <Table ariaLabel="Testemunhos">
        <TableHeader>
          <Column isRowHeader>Autor</Column>
          <Column>Testemunho</Column>
          <Column>Avaliação</Column>
          <Column>Origem</Column>
          <Column>Prioridade</Column>
          <Column>Data</Column>
          <Column>Estado</Column>
          <Column />
        </TableHeader>
        <TableBody>
          {testimonials.map((testimonial, index) => (
            <TestimonialRow
              key={testimonial.id}
              testimonial={testimonial}
              odd={index % 2 === 1}
            />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

const TestimonialRow = ({
  testimonial,
  odd,
}: {
  testimonial: Testimonial;
  odd: boolean;
}) => {
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  const { mutateAsync: updateTestimonial, isPending: isPendingUpdate } =
    useUpdateTestimonial();
  const { mutateAsync: deleteTestimonial, isPending: isPendingDelete } =
    useDeleteTestimonial();
  const showToast = useShowToast();

  const togglePublished = async () => {
    await updateTestimonial({
      id: testimonial.id,
      body: {
        authorName: testimonial.authorName,
        authorDetail: testimonial.authorDetail,
        text: testimonial.text,
        rating: testimonial.rating,
        photoURL: testimonial.photoURL,
        published: !testimonial.published,
        priority: testimonial.priority,
      },
    });
    showToast({
      text: testimonial.published
        ? "Testemunho despublicado"
        : "Testemunho publicado",
    });
  };

  const remove = async () => {
    if (!window.confirm("Apagar este testemunho?")) return;
    await deleteTestimonial({ id: testimonial.id });
    showToast({ text: "Testemunho apagado" });
  };

  return (
    <Row odd={odd}>
      <Cell>
        <div>
          <strong>{testimonial.authorName}</strong>
          {testimonial.authorDetail ? (
            <>
              <br />
              {testimonial.authorDetail}
            </>
          ) : null}
        </div>
      </Cell>
      <Cell>
        <div style={{ maxWidth: "24rem", whiteSpace: "normal" }}>
          {testimonial.text}
        </div>
      </Cell>
      <Cell>
        <div>{testimonial.rating ? `${testimonial.rating} ★` : "-"}</div>
      </Cell>
      <Cell>
        <div>
          <Tag
            size="small"
            text={testimonial.source === "google" ? "Google" : "Manual"}
            type={testimonial.source === "google" ? "info" : "neutral"}
          />
        </div>
      </Cell>
      <Cell>
        <div>{testimonial.priority}</div>
      </Cell>
      <Cell>
        <div>{formatDate(new Date(testimonial.createdAt))}</div>
      </Cell>
      <Cell>
        <div>
          <button
            type="button"
            onClick={() => void togglePublished()}
            disabled={isPendingUpdate}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            aria-label={
              testimonial.published ? "Despublicar testemunho" : "Publicar testemunho"
            }
          >
            <Tag
              size="small"
              text={testimonial.published ? "Publicado" : "Oculto"}
              type={testimonial.published ? "success" : "disabled"}
            />
          </button>
        </div>
      </Cell>
      <Cell>
        <div>
          <IconButton
            ariaLabel="Editar"
            icon={<IconUserInterfaceActionsEdit />}
            type="primary"
            onClick={() => setIsOpenEditModal(true)}
          />
          <IconButton
            ariaLabel="Apagar"
            icon={<IconUserInterfaceActionsDelete />}
            type="primary"
            disabled={isPendingDelete}
            onClick={() => void remove()}
          />
          <NewTestimonialModal
            isOpen={isOpenEditModal}
            setIsOpen={setIsOpenEditModal}
            initialTestimonial={testimonial}
          />
        </div>
      </Cell>
    </Row>
  );
};

export default TestimonialsTable;
