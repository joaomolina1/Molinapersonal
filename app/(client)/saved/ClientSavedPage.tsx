"use client";

import EmptyState from "@/_components/EmptyState";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useWatchlist } from "@/_models/watchlist";
import { createBEMClasses } from "@/_utils/classname";
import SavedSpaceCard, {
  SavedSpaceCardSkeleton,
} from "./_components/SavedSpaceCard";

const { block, element } = createBEMClasses("client-saved");

const ClientSavedPage = () => {
  const { data: watchlist } = useWatchlist();

  return (
    <Stack gap="1.5rem" className={block()}>
      <TextBlock title="Favoritos" />

      {!watchlist ? (
        <div className={element("grid")}>
          {[...Array(2)].map((_, index) => (
            <SavedSpaceCardSkeleton key={index} />
          ))}
        </div>
      ) : watchlist.spaces.length === 0 ? (
        <EmptyState
          text={{
            subtitle: "Ainda não guardou favoritos",
            body: "Guarde os seus locais favoritos ou aqueles onde planeia organizar um evento",
          }}
        />
      ) : (
        <div className={element("grid")}>
          {watchlist.spaces.map((spaceId) => (
            <SavedSpaceCard key={spaceId} spaceId={spaceId} />
          ))}
        </div>
      )}
    </Stack>
  );
};

export default ClientSavedPage;
