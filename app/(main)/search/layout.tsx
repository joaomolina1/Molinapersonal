import { createBEMClasses } from "@/_utils/classname";
import SearchHeader from "./_components/Header/Header";
import { SearchProvider } from "./useSearchState";
import { Suspense } from "react";
import Footer from "@/_components/Footer";

const { block } = createBEMClasses("search-layout");

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SearchProvider>
        <SearchHeader />
        <div className={block()}>{children}</div>
        <Footer />
      </SearchProvider>
    </Suspense>
  );
}
