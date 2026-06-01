import { InputError } from "@/_design_system/_utils/InputWrapper";
import Chip from "@/_design_system/Chip";
import {
  InputAddress,
  VenueAddress,
  VenueLocation,
} from "@/_design_system/Map";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Dispatch, SetStateAction } from "react";

const TravelExpensesAddress = ({
  fromBilling,
  setFromBilling,
  location,
  address,
  debouncedAddress,
  onChangeLocation,
  onChangeAddress,
  showErrors,
  error,
}: {
  fromBilling?: boolean;
  setFromBilling?: (fromBilling: boolean) => void;
  location?: VenueLocation | null;
  address?: VenueAddress | null;
  debouncedAddress?: VenueAddress | null;
  onChangeLocation?: Dispatch<SetStateAction<VenueLocation | null>>;
  onChangeAddress?: Dispatch<SetStateAction<VenueAddress | null>>;
  showErrors?: boolean;
  error?: string;
}) => {
  const title = "A partir de que morada quer contar a deslocação?";
  const subtitle = `Diga-nos a morada base onde opera o seu serviço que irá corresponder ao km "0". Faremos um cálculo arredondado entre a sua base e local do evento para estimar os custos de deslocação para prestar o seu serviço.`;

  return (
    <Stack gap="1.5rem" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock label={title} body={subtitle} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={title} body={subtitle} />
      </div>
      {error && <InputError error={error} />}
      <Stack row gap="1rem" flexWrap="wrap">
        <Chip
          label="Morada de faturação"
          checked={fromBilling === true}
          onChange={() => setFromBilling?.(true)}
        />
        <Chip
          label="Outra"
          checked={fromBilling === false}
          onChange={() => setFromBilling?.(false)}
        />
      </Stack>
      {fromBilling === false && (
        <InputAddress
          location={location}
          address={address}
          debouncedAddress={debouncedAddress}
          onChangeLocation={onChangeLocation}
          onChangeAddress={onChangeAddress}
          showErrors={showErrors}
        />
      )}
    </Stack>
  );
};

export default TravelExpensesAddress;
