import TextBlock from "@/_design_system/TextBlock";
import {
  Booking,
  useCancelBooking,
  useCheckoutBooking,
} from "@/_models/booking";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import DraftBookingDetails from "../DraftBookingDetails";
import DraftBookingForm from "../DraftBookingForm";
import { useSearchParams } from "next/navigation";
import { useDraftBookingFormState } from "../DraftBookingForm/DraftBookingForm";
import { useSession } from "@/_services/session";
import StripePaymentModal from "../StripePaymentModal";
import { useNavigationBlocker, useRouterReplace } from "@/_services/navigation";
import Button from "@/_design_system/Button";
import { usePayment } from "@/_models/payment";
import LoadingPaymentModal from "../LoadingPaymentModal";
import Alert from "@/_design_system/Alert";
import IconUserInterfaceActionsCancel from "@/_design_system/_icons/UserInterface/Actions/Cancel.svg";
import { useEffect, useState } from "react";
import AlreadyBookedModal from "@/_components/AlreadyBookedModal";

const { block, element } = createBEMClasses("book-page-draft");

const DraftOrInProgressBooking = ({ booking }: { booking: Booking }) => {
  const isMobile = useMediaQuery("large");
  const title = "Pedido de reserva";

  const [session] = useSession();
  const searchParams = useSearchParams();
  const routerReplace = useRouterReplace();

  // Booking draft

  const formState = useDraftBookingFormState(booking);
  const [isOpenAlreadyBooked, setIsOpenAlreadyBooked] = useState(false);

  const checkErrors = () => {
    formState.setShowErrors(true);

    if (formState.hasErrors) {
      if (formState.contactError) {
        formState.contactScrollIntoView();
        return true;
      }

      if (formState.billingError) {
        formState.billingScrollIntoView();
        return true;
      }

      if (formState.paymentError) {
        formState.paymentScrollIntoView();
        return true;
      }
    }

    return false;
  };

  const { mutateAsync: checkout, isPending: isPendingCheckout } =
    useCheckoutBooking();

  const handleCheckout = async () => {
    if (!checkErrors()) {
      try {
        const { paymentID, clientSecret } = await checkout({
          id: booking.id,
          body: {
            contactName: session?.name,
            contactEmail: session?.email,
            contactPhoneExtension: formState.phone.extension!,
            contactPhoneNumber: formState.phone.number!,
            billingCountry: formState.country,
            billingName: formState.name,
            billingVAT: formState.vat,
            billingAddress: formState.address,
            billingPostCode: formState.zip,
            billingCity: formState.city,
          },
        });

        const params = new URLSearchParams(searchParams);
        params.set("paymentID", paymentID);
        params.set("clientSecret", clientSecret);
        routerReplace(`/book?${params.toString()}`, undefined, true);
      } catch (e) {
        if ((e as Error).message.includes("already_booked")) {
          setIsOpenAlreadyBooked(true);
        } else {
          throw e;
        }
      }
    }
  };

  const backToSearch = () => {
    const params = new URLSearchParams();
    params.set("date", booking.date.toString());
    params.set("numPeople", booking.numPeople.toString());

    if (booking.start && booking.end) {
      params.set("start", booking.start.string);
      params.set("end", booking.end.string);
    }

    routerReplace(
      `/space/${booking.spaceID}?` + params.toString(),
      undefined,
      true,
    );
  };

  const { mutateAsync: cancel, isPending: isPendingCancel } =
    useCancelBooking();

  const handleCancel = async () => {
    await cancel({ id: booking.id });
    backToSearch();
  };

  // Booking inProgress

  const clientSecret = searchParams.get("clientSecret");
  const paymentID = searchParams.get("paymentID");

  const { data: payment } = usePayment(paymentID ?? undefined);

  const disableFormAndFooter =
    booking.status === "inProgress" || !!clientSecret;

  // Block navigation

  const { setBlockerData } = useNavigationBlocker();

  useEffect(() => {
    if (booking.status === "inProgress" && !!paymentID && !!clientSecret) {
      setBlockerData(null);
    } else {
      setBlockerData({
        content: "Pretende abandonar a reserva em curso?",
        noLabel: "Não, regressar à reserva",
        yesLabel: "Sim, abandonar a reserva",
        yesAction: async () => {
          await cancel({ id: booking.id });
        },
        yesLoading: isPendingCancel,
      });
    }

    return () => {
      setBlockerData(null);
    };
  }, [
    booking.id,
    booking.status,
    cancel,
    clientSecret,
    isPendingCancel,
    paymentID,
    setBlockerData,
  ]);

  return (
    <>
      <main className={block()}>
        <TextBlock
          title={isMobile ? undefined : title}
          subtitle={isMobile ? title : undefined}
          className={element("title")}
        />
        <div className={element("details")}>
          <DraftBookingDetails booking={booking} />
        </div>
        <div className={element("form")}>
          <DraftBookingForm state={formState} disabled={disableFormAndFooter} />
          {booking.status === "inProgress" && !!paymentID && !!payment && (
            <>
              {!!clientSecret && (
                <StripePaymentModal
                  clientSecret={clientSecret}
                  paymentID={paymentID}
                  bookingID={booking.id}
                />
              )}
              {!clientSecret && <LoadingPaymentModal booking={booking} />}
            </>
          )}
          {payment?.status === "cancelled" && (
            <Alert
              icon={<IconUserInterfaceActionsCancel />}
              title="Pagamento recusado"
              text="Houve um erro ao processar o seu pagamento. Tente novamente."
              variant="error"
              className={element("error")}
            />
          )}
        </div>
      </main>
      <footer>
        <div>
          <Button
            label="Pagar e Reservar"
            type="primary"
            onClick={handleCheckout}
            loading={isPendingCheckout}
            disabled={disableFormAndFooter}
          />
          <Button
            label="Cancelar pedido"
            type="secondary"
            onClick={handleCancel}
            loading={isPendingCancel}
            disabled={disableFormAndFooter}
          />
        </div>
      </footer>
      <AlreadyBookedModal
        isOpen={isOpenAlreadyBooked}
        onBackToSearch={backToSearch}
      />
    </>
  );
};

export default DraftOrInProgressBooking;
