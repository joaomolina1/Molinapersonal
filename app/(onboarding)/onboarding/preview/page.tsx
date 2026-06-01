import { Suspense } from "react";
import SpacePreview from "../_components/SpacePreview";
import { SearchProvider } from "@/(main)/search/useSearchState";

export default function Preview() {
  return (
    <Suspense fallback={null}>
      <SearchProvider>
        <SpacePreview />
      </SearchProvider>
    </Suspense>
  );
}
