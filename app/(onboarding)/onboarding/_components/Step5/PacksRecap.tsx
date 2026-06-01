import { Pack, useCreatePack } from "@/_models/pack";
import RecapItem from "./RecapItem";
import Stack from "@/_design_system/Stack";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import PackCard from "../_shared/PackCard";
import { useSession } from "@/_services/session";
import { useRouterPush } from "@/_services/navigation";

const PacksRecap = ({ packs, spaceID }: { packs: Pack[]; spaceID: string }) => {
  const routerPush = useRouterPush();

  const {
    mutateAsync: createPack,
    isPending: isPendingCreatePack,
    isSuccess: isSuccessCreatePack,
  } = useCreatePack();

  const addPack = async () => {
    const newPack = await createPack({ spaceID });
    routerPush(`/onboarding/pack?packID=${newPack.id}`);
  };

  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  return (
    <div>
      <div>
        <RecapItem label="Packs" />
      </div>
      <Stack gap="1.5rem">
        {packs.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            showStatus
            enableEdit={pack.isInProgress && !isAdmin}
          />
        ))}
        {!isAdmin && (
          <Stack row justifyContent="flex-end">
            <Button
              type="secondary"
              label="Adicionar outro pack"
              leftIcon={<IconUserInterfaceActionsAdd />}
              onClick={addPack}
              loading={isPendingCreatePack || isSuccessCreatePack}
            />
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default PacksRecap;
