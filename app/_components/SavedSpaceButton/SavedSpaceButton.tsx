import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsSave from "@/_design_system/_icons/UserInterface/Actions/Save.svg";
import Button, { NavButton } from "@/_design_system/Button";
import { useShowToast } from "@/_design_system/Toast";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "@/_models/watchlist";
import { useSession } from "@/_services/session";

const SavedSpaceButton = ({
  spaceId,
  variant,
}: {
  spaceId: string;
  variant:
    | "space-card"
    | "space-card-saved"
    | "space-page-desktop"
    | "space-page-mobile";
}) => {
  const [session] = useSession();
  const showToast = useShowToast();

  const { data: watchlist, isFetching: isFetchingWatchlist } = useWatchlist();

  const {
    mutateAsync: addToWatchlist,
    isPending: isPendingAddToWatchlist,
    isSuccess: isSuccessAddToWatchlist,
    reset: resetAddToWatchlist,
  } = useAddToWatchlist();

  const {
    mutateAsync: removeFromWatchlist,
    isPending: isPendingRemoveFromWatchlist,
    isSuccess: isSuccessRemoveFromWatchlist,
    reset: resetRemoveFromWatchlist,
  } = useRemoveFromWatchlist();

  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist({ id: spaceId });
      resetAddToWatchlist();
    } catch (e) {
      console.error(e);
      showToast({ text: "Ocorreu um erro ao guardar o espaço nos favoritos" });
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      await removeFromWatchlist({ id: spaceId });
      resetRemoveFromWatchlist();
    } catch (e) {
      console.error(e);
      showToast({ text: "Ocorreu um erro ao retirar o espaço dos favoritos" });
    }
  };

  if (!session || !watchlist) {
    return null;
  }

  const saved = watchlist.spaces.includes(spaceId);

  const loading =
    isPendingAddToWatchlist ||
    isSuccessAddToWatchlist ||
    isPendingRemoveFromWatchlist ||
    isSuccessRemoveFromWatchlist ||
    isFetchingWatchlist;

  const onClick = () => {
    if (saved) {
      handleRemoveFromWatchlist();
    } else {
      handleAddToWatchlist();
    }
  };

  if (variant === "space-page-desktop") {
    return (
      <Button
        type="secondary"
        label={saved ? "Guardado" : "Guardar"}
        leftIcon={<IconUserInterfaceActionsSave saved={saved} />}
        onClick={onClick}
        disabled={loading}
      />
    );
  }

  return (
    <NavButton
      ariaLabel={saved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      icon={
        variant === "space-card-saved" ? (
          <IconUserInterfaceActionsDelete />
        ) : (
          <IconUserInterfaceActionsSave saved={saved} />
        )
      }
      onClick={onClick}
      disabled={loading}
    />
  );
};

export default SavedSpaceButton;
