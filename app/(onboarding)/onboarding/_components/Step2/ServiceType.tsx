import { SERVICE_TYPES, ServiceType } from "@/_constants/space/serviceTypes";
import ChipList from "../_shared/ChipList";

const ServiceTypeInput = ({
  serviceType,
  setServiceType,
  error,
  disabled,
}: {
  serviceType?: ServiceType;
  setServiceType?: (serviceType: ServiceType) => void;
  error?: string;
  disabled?: boolean;
}) => {
  return (
    <ChipList
      subtitle="Escolha a categoria que melhor define o seu serviço"
      body="Escolha apenas um tipo de serviço. Se a sua empresa vende mais do que um dos tipos de serviço aqui descritos, termine esta oferta e crie outro serviço depois."
      chipLists={[{ chips: SERVICE_TYPES }]}
      selected={serviceType ? [serviceType] : []}
      onChange={(selected) => setServiceType?.(selected[0])}
      limit={1}
      error={error}
      disabled={disabled}
    />
  );
};

export default ServiceTypeInput;
