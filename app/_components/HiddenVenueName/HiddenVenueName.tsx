import { Subscription } from "@/_models/venue";
import { useSession } from "@/_services/session";

export const useHideVenueName = (subscription: Subscription | undefined) => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const hideVenueName = !isAdmin && subscription === "basic";

  return hideVenueName;
};

const HiddenVenueName = ({
  name,
  subscription = "basic",
  fallback,
}: {
  name: string | undefined;
  subscription: Subscription | undefined;
  fallback?: string;
}) => {
  const hideVenueName = useHideVenueName(subscription);

  return (
    <>
      {!!name && (
        <span style={hideVenueName ? { display: "none" } : undefined}>
          {name}
        </span>
      )}
      {!!fallback && hideVenueName && <span>{fallback}</span>}
    </>
  );
};

export default HiddenVenueName;
