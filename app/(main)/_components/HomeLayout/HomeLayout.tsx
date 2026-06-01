import { PropsWithChildren } from "react";

const HomeLayout = ({ children }: PropsWithChildren) => {
  return <div className="home-page-layout">{children}</div>;
};

export default HomeLayout;
