import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceNavigationArrowLeft from "../_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "../_icons/UserInterface/Navigation/ArrowRight.svg";
import Button, { NavButton } from "../Button";
import Stack from "../Stack";
import { CSSProperties, Fragment } from "react";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("pagination");

const Pagination = ({
  page,
  setPage,
  numPages,
  isLastPage,
  className,
  style,
}: {
  page: number;
  setPage: (page: number) => void;
  className?: string;
  style?: CSSProperties;
} & (
  | { numPages: number; isLastPage?: never }
  | { numPages?: never; isLastPage: boolean | undefined }
)) => {
  const isSmallMobile = useMediaQuery("small");

  const PageButton = ({ page }: { page: number }) => (
    <Button
      label={page}
      type="link"
      className={element("page")}
      onClick={() => setPage(page)}
    />
  );

  const Etc = () => <div className={element("etc")}>...</div>;

  const CurrentPage = () => (
    <div className={element("current-page")}>{page}</div>
  );

  return (
    <Stack
      row
      alignItems="center"
      justifyContent="center"
      gap="0.5rem"
      className={block(undefined, className)}
      style={style}
    >
      <NavButton
        ariaLabel="Página anterior"
        icon={<IconUserInterfaceNavigationArrowLeft />}
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        shape="square"
        type="primary"
      />
      {numPages !== undefined ? (
        Array.from({ length: numPages }, (_, i) => i + 1).map((mapPage) => {
          if (isSmallMobile) {
            /* Goal:
             * 1.  1
             *
             * 1.  1 2
             * 2.  1 2
             *
             * 1.  1 2 3
             * 2.  1 2 3
             * 3.  1 2 3
             *
             * 1.  1 2 3 4
             * 2.  1 2 3 4
             * 3.  1 2 3 4
             * 4.  1 2 3 4
             *
             * 1.  1 2 ... 5
             * 2.  1 2 ... 5
             * 3.  1 ... 3 ... 5
             * 4.  1 ... 4 5
             * 5.  1 ... 4 5
             *
             * 1.  1 2 ... 6
             * 2.  1 2 ... 6
             * 3.  1 ... 3 ... 6
             * 4.  1 ... 4 ... 6
             * 5.  1 ... 5 6
             * 6.  1 ... 5 6
             */

            // Current page
            if (mapPage === page) {
              return <CurrentPage key={mapPage} />;
            }

            // With 4 pages or less, display them all
            if (numPages <= 4) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // First page
            if (mapPage === 1 && page > 1) {
              return (
                <Fragment key={mapPage}>
                  <PageButton page={mapPage} />
                  {page > 2 && <Etc />}
                </Fragment>
              );
            }

            // Second page
            if (mapPage === 2 && page === 1) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // Before last page
            if (mapPage === numPages - 1 && page === numPages) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // Last page
            if (mapPage === numPages && page < numPages) {
              return (
                <Fragment key={mapPage}>
                  {page < numPages - 1 && <Etc />}
                  <PageButton page={mapPage} />
                </Fragment>
              );
            }

            return null;
          } else {
            /* Goal:
             * 1.  1
             *
             * 1.  1 2
             * 2.  1 2
             *
             * 1.  1 2 3
             * 2.  1 2 3
             * 3.  1 2 3
             *
             * 1.  1 2 3 4
             * 2.  1 2 3 4
             * 3.  1 2 3 4
             * 4.  1 2 3 4
             *
             * 1.  1 2 3 4 5
             * 2.  1 2 3 4 5
             * 3.  1 2 3 4 5
             * 4.  1 2 3 4 5
             * 5.  1 2 3 4 5
             *
             * 1.  1 2 3 4 5 6
             * 2.  1 2 3 4 5 6
             * 3.  1 2 3 4 5 6
             * 4.  1 2 3 4 5 6
             * 5.  1 2 3 4 5 6
             * 6.  1 2 3 4 5 6
             *
             * 1.  1 2 3 4 5 6 7
             * 2.  1 2 3 4 5 6 7
             * 3.  1 2 3 4 5 6 7
             * 4.  1 2 3 4 5 6 7
             * 5.  1 2 3 4 5 6 7
             * 6.  1 2 3 4 5 6 7
             * 7.  1 2 3 4 5 6 7
             *
             * 1.  1 2 3 4 ... 8
             * 2.  1 2 3 4 ... 8
             * 3.  1 2 3 4 ... 8
             * 4.  1 ... 3 4 5 ... 8
             * 5.  1 ... 4 5 6 ... 8
             * 6.  1 ... 5 6 7 8
             * 7.  1 ... 5 6 7 8
             * 8.  1 ... 5 6 7 8
             *
             * 1.  1 2 3 4 ... 9
             * 2.  1 2 3 4 ... 9
             * 3.  1 2 3 4 ... 9
             * 4.  1 ... 3 4 5 ... 9
             * 5.  1 ... 4 5 6 ... 9
             * 6.  1 ... 5 6 7 ... 9
             * 7.  1 ... 6 7 8 9
             * 8.  1 ... 6 7 8 9
             * 9.  1 ... 6 7 8 9
             */

            if (mapPage === page) {
              return <CurrentPage key={mapPage} />;
            }

            // With 7 pages or less, display them all
            if (numPages <= 7) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // During the first 3 pages, display the first four then the last
            if (page <= 3) {
              if (mapPage <= 4 && mapPage !== page) {
                return <PageButton page={mapPage} key={mapPage} />;
              }

              if (mapPage === numPages) {
                return (
                  <Fragment key={mapPage}>
                    <Etc />
                    <PageButton page={mapPage} />
                  </Fragment>
                );
              }
            }

            // During the last 3 pages, display the first then the last four
            if (page >= numPages - 2) {
              if (mapPage === 1) {
                return (
                  <Fragment key={mapPage}>
                    <PageButton page={mapPage} />
                    <Etc />
                  </Fragment>
                );
              }

              if (mapPage >= numPages - 3 && mapPage !== page) {
                return <PageButton page={mapPage} key={mapPage} />;
              }
            }

            // First page
            if (mapPage === 1) {
              return (
                <Fragment key={mapPage}>
                  <PageButton page={mapPage} />
                  <Etc />
                </Fragment>
              );
            }

            // Previous page
            if (mapPage === page - 1) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // Next page
            if (mapPage === page + 1) {
              return <PageButton page={mapPage} key={mapPage} />;
            }

            // Last page
            if (mapPage === numPages) {
              return (
                <Fragment key={mapPage}>
                  {page < numPages - 1 && <Etc />}
                  <PageButton page={mapPage} />
                </Fragment>
              );
            }

            return null;
          }
        })
      ) : (
        <>
          {page > 1 && <PageButton page={1} />}
          {page > 2 && <Etc />}
          <CurrentPage />
        </>
      )}
      <NavButton
        ariaLabel="Página seguinte"
        icon={<IconUserInterfaceNavigationArrowRight />}
        onClick={() => setPage(page + 1)}
        disabled={numPages !== undefined ? numPages === page : isLastPage}
        shape="square"
        type="primary"
      />
    </Stack>
  );
};

export default Pagination;
