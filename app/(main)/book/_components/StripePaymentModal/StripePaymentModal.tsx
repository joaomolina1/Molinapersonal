import { IconButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import { useCancelPayment } from "@/_models/payment";
import { useRouterReplace } from "@/_services/navigation";
import config from "@/_utils/config";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(config.stripePublishableKey ?? "");

const StripePaymentModal = ({
  bookingID,
  paymentID,
  clientSecret,
}: {
  bookingID: string;
  paymentID: string;
  clientSecret: string;
}) => {
  const routerReplace = useRouterReplace();
  const { mutateAsync: cancelPayment } = useCancelPayment();

  const handleClose = async () => {
    await cancelPayment({ id: paymentID });
    routerReplace(`/book?bookingID=${bookingID}`, undefined, true);
  };

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <Modal
        isOpen={true}
        ariaLabel="Pagamento da reserva"
        isDismissable={false}
        showCloseButton={false}
      >
        <Stack row justifyContent="flex-end" style={{ position: "relative" }}>
          <IconButton
            ariaLabel="Cancelar pagamento"
            onClick={handleClose}
            icon={<IconUserInterfaceActionsClose />}
            style={{ position: "absolute", top: 0, right: 0 }}
          />
        </Stack>
        <EmbeddedCheckout />
      </Modal>
    </EmbeddedCheckoutProvider>
  );
};

export default StripePaymentModal;
