import CircleLoader from "@/_design_system/CircleLoader";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import { Booking } from "@/_models/booking";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";

const { block } = createBEMClasses("book-loading-payment-modal");

const LoadingPaymentModal = ({ booking }: { booking: Booking }) => {
  return (
    <Modal
      isOpen={true}
      ariaLabel="Pagamento em processamento"
      isDismissable={false}
      showCloseButton={false}
    >
      <div className={block()}>
        <CircleLoader size={150} />
        <Stack gap="1rem">
          <h1>Está quase!</h1>
          <h2>Estamos a aguardar a confirmação do pagamento</h2>
          <h6>Valor da reserva: {formatMoney(booking.totalAmount)}</h6>
        </Stack>
      </div>
    </Modal>
  );
};

export default LoadingPaymentModal;
