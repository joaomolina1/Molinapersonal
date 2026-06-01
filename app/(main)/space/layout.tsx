import { createBEMClasses } from "@/_utils/classname";
import Footer from "@/_components/Footer";
import SearchHeader from "../search/_components/Header";

const { block } = createBEMClasses("search-layout");

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SearchHeader />
      <div className={block()}>{children}</div>
      <Footer />
    </>
  );
}
