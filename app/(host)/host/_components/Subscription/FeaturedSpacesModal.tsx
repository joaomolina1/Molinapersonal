import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import InputCheckbox from "@/_design_system/InputCheckbox";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useSpaces } from "@/_models/space";
import {
  Subscription,
  useFeaturedSpaces,
  useSetFeaturedSpaces,
} from "@/_models/subscription";
import { createBEMClasses } from "@/_utils/classname";
import { useMemo, useState } from "react";

const { block, element } = createBEMClasses("featured-spaces");

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const FeaturedSpacesModal = ({
  venueID,
  subscription,
  isOpen,
  setIsOpen,
}: {
  venueID: string;
  subscription: Subscription;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const { data: spaces = [] } = useSpaces({ venueID });
  const { data: featured = [] } = useFeaturedSpaces(venueID);
  const { mutateAsync: save, isPending } = useSetFeaturedSpaces();

  const activeSpaces = spaces.filter((space) => space.status === "active");

  const lockedUntilBySpace = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of featured) {
      if (item.mode === "search" && item.lockedUntil) {
        map.set(item.spaceID, item.lockedUntil);
      }
    }
    return map;
  }, [featured]);

  const initialSelected = useMemo(
    () =>
      featured.filter((f) => f.mode === "search").map((f) => f.spaceID),
    [featured],
  );
  const initialHome = useMemo(
    () => featured.find((f) => f.mode === "home")?.spaceID ?? null,
    [featured],
  );

  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [homeSpaceID, setHomeSpaceID] = useState<string | null>(initialHome);
  const [error, setError] = useState("");

  const max = subscription.maxFeaturedSpaces;
  const isLocked = (spaceID: string) => {
    const until = lockedUntilBySpace.get(spaceID);
    return !!until && until > new Date().toISOString().slice(0, 10);
  };

  const toggle = (spaceID: string) => {
    setError("");
    if (selected.includes(spaceID)) {
      if (isLocked(spaceID)) return; // cannot remove while locked
      setSelected(selected.filter((id) => id !== spaceID));
      if (homeSpaceID === spaceID) setHomeSpaceID(null);
    } else {
      if (selected.length >= max) return;
      setSelected([...selected, spaceID]);
    }
  };

  const handleSave = async () => {
    setError("");
    try {
      await save({ venueID, spaceIDs: selected, homeSpaceID });
      setIsOpen(false);
    } catch (e) {
      const message = (e as Error).message ?? "";
      if (message.includes("bloqueado") || message.includes("409")) {
        setError(
          "Um dos espaços ainda está bloqueado e não pode ser substituído.",
        );
      } else {
        setError("Não foi possível guardar os espaços em destaque.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel="Espaços em destaque"
      width="large"
    >
      <Stack gap="1.5rem" className={block()}>
        <Stack gap="0.5rem">
          <h3>Espaços em destaque</h3>
          <p className={element("lead")}>
            Escolha até {max} {max === 1 ? "espaço" : "espaços"} para ganhar
            destaque na Página de Oferta
            {subscription.supportsHome ? " e na Página Inicial" : ""}. Um espaço
            fica bloqueado durante {subscription.lockMonths}{" "}
            {subscription.lockMonths === 1 ? "mês" : "meses"} antes de poder ser
            substituído.
          </p>
        </Stack>

        {!!error && <InputError error={error} />}

        {activeSpaces.length === 0 ? (
          <p className={element("empty")}>
            Ainda não tem espaços ativos para destacar.
          </p>
        ) : (
          <Stack gap="0.75rem">
            {activeSpaces.map((space) => {
              const checked = selected.includes(space.id);
              const locked = isLocked(space.id);
              const atLimit = !checked && selected.length >= max;
              const until = lockedUntilBySpace.get(space.id);

              return (
                <div key={space.id} className={element("item")}>
                  <InputCheckbox
                    checked={checked}
                    onChange={() => toggle(space.id)}
                    disabled={locked || atLimit}
                    label={space.name || "Sem nome"}
                  />
                  <Stack row gap="0.5rem" alignItems="center">
                    {locked && until && (
                      <Tag
                        size="small"
                        type="warning"
                        text={`Bloqueado até ${formatDate(until)}`}
                      />
                    )}
                    {subscription.supportsHome && checked && (
                      <Button
                        type={homeSpaceID === space.id ? "primary" : "secondary"}
                        label={
                          homeSpaceID === space.id
                            ? "Na Página Inicial"
                            : "Pôr na Página Inicial"
                        }
                        onClick={() =>
                          setHomeSpaceID(
                            homeSpaceID === space.id ? null : space.id,
                          )
                        }
                      />
                    )}
                  </Stack>
                </div>
              );
            })}
          </Stack>
        )}

        <Stack row gap="1rem" justifyContent="flex-end">
          <Button
            type="secondary"
            label="Cancelar"
            onClick={() => setIsOpen(false)}
          />
          <Button
            type="primary"
            label="Guardar"
            onClick={handleSave}
            loading={isPending}
            disabled={activeSpaces.length === 0}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default FeaturedSpacesModal;
