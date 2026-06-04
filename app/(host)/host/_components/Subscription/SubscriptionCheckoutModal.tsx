import Modal from "@/_design_system/Modal";
import config from "@/_utils/config";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(config.stripePublishableKey ?? "");

const SubscriptionCheckoutModal = ({
  clientSecret,
  onClose,
}: {
  clientSecret: string;
  onClose: () => void;
}) => {
  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <Modal
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        ariaLabel="Subscrição do plano"
        width="large"
      >
        <EmbeddedCheckout />
      </Modal>
    </EmbeddedCheckoutProvider>
  );
};

export default SubscriptionCheckoutModal;
