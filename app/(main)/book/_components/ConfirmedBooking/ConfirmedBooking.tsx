import BookingFullDetails from "@/_components/BookingFullDetails";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import IllustrationSuccess from "@/_design_system/_illustrations/Success.svg";
import { Booking } from "@/_models/booking";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { getLocalTimeZone } from "@internationalized/date";

const { block, element } = createBEMClasses("book-page-confirmed");

const ConfirmedBooking = ({ booking }: { booking: Booking }) => {
  const date = booking.date.toDate(getLocalTimeZone());
  const cancellationDate = new Date(booking.freeCancellationUntil);

  return (
    <>
      <main className={block()}>
        <div className={element("success")}>
          <IllustrationSuccess />
          <p>
            Já está!
            <br />
            A sua reserva está confirmada.
            <br />
            <br />
            <span>Confirmação:</span> {booking.shortId}
          </p>
        </div>
        <div className={element("reminders")}>
          <h5>Não se esqueça...</h5>
          <ul>
            <li>
              <IconUserInterfaceActionsCheck />
              <p>
                Esperamos por si no dia{" "}
                <b>
                  {[
                    formatDate(date, { day: "numeric" }),
                    formatDate(date, { month: "short" }).slice(0, -1),
                    formatDate(date, { year: "numeric" }),
                  ].join(" ")}
                </b>{" "}
                das{" "}
                <b>
                  {booking.start?.timeLabel} às {booking.end?.timeLabel}
                </b>
              </p>
            </li>
            <li>
              <IconUserInterfaceActionsCheck />
              <p>
                Pode cancelar <b>gratuitamente</b> até{" "}
                <b>
                  {[
                    formatDate(cancellationDate, { day: "numeric" }),
                    formatDate(cancellationDate, { month: "short" }).slice(
                      0,
                      -1,
                    ),
                    formatDate(cancellationDate, { year: "numeric" }),
                  ].join(" ")}
                </b>{" "}
                às <b>{formatDate(cancellationDate, { timeStyle: "short" })}</b>
              </p>
            </li>
            <li>
              <IconUserInterfaceActionsCheck />
              <p>
                Foi enviado um email de confirmação para o email{" "}
                <b>{booking.contactEmail}</b>
              </p>
            </li>
            <li>
              <IconUserInterfaceActionsCheck />
              <p>
                Pode aceder à reserva no menu “As minhas reservas”, na página
                principal
              </p>
            </li>
          </ul>
        </div>
        <div className={element("details")}>
          <BookingFullDetails booking={booking} />
        </div>
      </main>
      <footer>
        <div>
          <Button
            label="Ir para as minhas reservas"
            type="primary"
            href="/my-bookings"
          />
        </div>
      </footer>
    </>
  );
};

export default ConfirmedBooking;
