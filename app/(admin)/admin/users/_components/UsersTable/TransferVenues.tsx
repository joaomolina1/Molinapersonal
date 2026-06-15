import Button from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import EmptyState from "@/_components/EmptyState";
import {
  User,
  useFindUserByEmail,
  useTransferVenueOwner,
} from "@/_models/user";
import { useVenues } from "@/_models/venue";
import { useState } from "react";

const TransferVenues = ({ user }: { user: User }) => {
  const { data: venues = [] } = useVenues();
  const ownedVenues = venues.filter((venue) => venue.ownerID === user.id);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: findUser, isPending: isFinding } = useFindUserByEmail();
  const { mutateAsync: transfer, isPending: isTransferring } =
    useTransferVenueOwner();
  const showToast = useShowToast();

  const handleTransfer = async (venueID: string, venueName: string) => {
    setError(null);
    if (!email.includes("@")) {
      setError("Indique o email do novo proprietário");
      return;
    }
    try {
      const target = await findUser({ email: email.trim() });
      await transfer({ venueID, ownerID: target.userID });
      showToast({
        text: `"${venueName}" transferido para ${target.name || target.email}`,
      });
    } catch (e: unknown) {
      const message = String((e as Error)?.message ?? "");
      setError(
        message.includes("404")
          ? "Não existe nenhum utilizador com esse email"
          : "Não foi possível transferir o local",
      );
    }
  };

  return (
    <Stack gap="0.75rem" alignItems="flex-start">
      <h5>Transferir locais / empresas</h5>
      {ownedVenues.length === 0 ? (
        <EmptyState
          text={{ body: "Este utilizador não é proprietário de locais." }}
        />
      ) : (
        <>
          <InputText
            label="Email do novo proprietário"
            type="email"
            value={email}
            onChange={setEmail}
            style={{ width: "20rem", maxWidth: "100%" }}
          />
          <Stack gap="0.5rem" style={{ width: "100%" }}>
            {ownedVenues.map((venue) => (
              <Stack
                row
                key={venue.id}
                justifyContent="space-between"
                alignItems="center"
                gap="1rem"
              >
                <Stack row gap="0.5rem" alignItems="center">
                  <span>{venue.name || "Local sem nome"}</span>
                  <Tag size="small" text={venue.city || "—"} />
                </Stack>
                <Button
                  type="secondary"
                  label="Transferir"
                  loading={isFinding || isTransferring}
                  disabled={!email.includes("@")}
                  onClick={() => void handleTransfer(venue.id, venue.name)}
                />
              </Stack>
            ))}
          </Stack>
          {error && <InputError error={error} />}
        </>
      )}
    </Stack>
  );
};

export default TransferVenues;
