"use client";

import Button, { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { getLocalTimeZone, getDayOfWeek } from "@internationalized/date";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { useState } from "react";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import CellWithColspan from "@/_design_system/_utils/CellWithColspan";
import { formatDate } from "@/_utils/date";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import { CalendarList } from "../useCalendarList";
import VenueName from "@/(host)/host/_components/VenueName";
import CalendarDay from "./CalendarDay";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { Space } from "@/_models/space";
import IconUserInterfaceFormsCalendarLink from "@/_design_system/_icons/UserInterface/Forms/CalendarLink.svg";

const { block, element } = createBEMClasses("host-calendar");

const Calendar = ({ calendarList }: { calendarList: CalendarList }) => {
  const isMobile = useMediaQuery("medium");
  const showSpaceNameColumn = !isMobile;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleRowClick = (key: string) => {
    if (key.includes("detail")) {
      return;
    }

    setExpanded({
      ...expanded,
      [key]: key in expanded ? !expanded[key] : true,
    });
  };

  if (calendarList.isPendingRows) {
    return null;
  }

  return (
    <Stack gap="2.5rem">
      {calendarList.venues.map((venue) => (
        <Stack gap="1.5rem" key={venue.venue.id}>
          <div className={element("name")}>
            <VenueName venue={venue.venue} />
            <Button
              type="secondary"
              leftIcon={<IconUserInterfaceFormsCalendarLink />}
              label="Sincronizar calendários"
              href="/host/calendar/link"
            />
          </div>
          <div className={element("wrapper")}>
            <Table
              aria-label="Calendário de reservas do local"
              className={block({
                withoutSpaceNameColumn: !showSpaceNameColumn,
              })}
              onRowAction={(key) => handleRowClick(key as string)}
            >
              <TableHeader>
                {showSpaceNameColumn && (
                  <Column isRowHeader className={element("column-main")} />
                )}
                {calendarList.dates.map((date, index) => (
                  <Column
                    key={date.toString()}
                    className={element("column")}
                    isRowHeader={!showSpaceNameColumn}
                  >
                    <Stack>
                      <span className={element("column__weekday")}>
                        {weekdayName[getDayOfWeek(date, "fr")]}
                      </span>
                      <span className={element("column__day")}>{date.day}</span>
                      {((index === 0 &&
                        calendarList.dates[index + 1].day !== 1) ||
                        date.day === 1) && (
                        <p className={element("month")}>
                          {formatDate(date.toDate(getLocalTimeZone()), {
                            month: "short",
                          }).slice(0, -1)}{" "}
                          {formatDate(date.toDate(getLocalTimeZone()), {
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {index === calendarList.dates.length - 1 && (
                        <div className={element("next-week")}>
                          <IconButton
                            ariaLabel="Próxima semana"
                            icon={<IconUserInterfaceNavigationArrowRight />}
                            style={{ fontSize: "1rem" }}
                            onClick={calendarList.viewNextWeek}
                          />
                        </div>
                      )}
                      {index === 0 && (
                        <div className={element("prev-week")}>
                          <IconButton
                            ariaLabel="Semana anterior"
                            icon={<IconUserInterfaceNavigationArrowLeft />}
                            style={{ fontSize: "1rem" }}
                            onClick={calendarList.viewPreviousWeek}
                          />
                        </div>
                      )}
                    </Stack>
                  </Column>
                ))}
              </TableHeader>
              <TableBody>
                {venue.spaces.map((space) => (
                  <SpaceRow
                    key={space.space.id}
                    space={space}
                    expanded={expanded[space.space.id] ?? false}
                    showSpaceNameColumn={showSpaceNameColumn}
                    isPendingDetails={calendarList.isPendingDetails}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Stack>
      ))}
    </Stack>
  );
};

const SpaceRow = ({
  space,
  expanded,
  isPendingDetails,
  showSpaceNameColumn,
}: {
  space: CalendarList["venues"][number]["spaces"][number];
  expanded: boolean;
  isPendingDetails: boolean;
  showSpaceNameColumn: boolean;
}) => {
  return (
    <>
      <Row id={space.space.id} className={element("space-row")}>
        {showSpaceNameColumn && (
          <Cell>
            <SpaceName space={space.space} expanded={expanded} />
          </Cell>
        )}
        {space.weeks.map((week, weekIndex) =>
          week.dates.map((date, dateIndex) => (
            <Cell
              key={date.date.toString()}
              className={element("day", {
                status: isPendingDetails
                  ? "pending"
                  : date.isInternalBookingBlocked
                    ? "blocked"
                    : date.bookingsCount > 0
                      ? "booked"
                      : "free",
                withoutSpaceNameColumn: !showSpaceNameColumn,
              })}
            >
              {date.bookingsCount > 0 ? (
                <div>{date.bookingsCount}</div>
              ) : (
                <div />
              )}
              {!showSpaceNameColumn && weekIndex === 0 && dateIndex === 0 && (
                <div className={element("day__space-name")}>
                  <SpaceName space={space.space} expanded={expanded} />
                </div>
              )}
            </Cell>
          )),
        )}
      </Row>
      {expanded && (
        <SpaceDetailRow
          space={space}
          showSpaceNameColumn={showSpaceNameColumn}
        />
      )}
    </>
  );
};

const SpaceName = ({
  space,
  expanded,
}: {
  space: Space;
  expanded: boolean;
}) => {
  return (
    <Stack row gap="1rem" className={element("space-name")} alignItems="center">
      {expanded ? (
        <IconUserInterfaceNavigationArrowUp style={{ fontSize: "1rem" }} />
      ) : (
        <IconUserInterfaceNavigationArrowDown style={{ fontSize: "1rem" }} />
      )}
      <h5>{space.name}</h5>
    </Stack>
  );
};

const SpaceDetailRow = ({
  space,
  showSpaceNameColumn,
}: {
  space: CalendarList["venues"][number]["spaces"][number];
  showSpaceNameColumn: boolean;
}) => {
  return (
    <Row id={`${space.space.id}-detail`}>
      {showSpaceNameColumn && <Cell />}
      {space.weeks.map((week) => (
        <CellWithColspan
          key={week.week}
          colspan={7}
          className={element("bookings")}
        >
          <Stack gap="1.5rem">
            {week.dates.map((date) => (
              <CalendarDay
                key={date.date.toString()}
                spaceID={space.space.id}
                date={date}
              />
            ))}
          </Stack>
        </CellWithColspan>
      ))}
    </Row>
  );
};

const weekdayName: { [key: number]: string } = {
  0: "Seg",
  1: "Ter",
  2: "Qua",
  3: "Qui",
  4: "Sex",
  5: "Sab",
  6: "Dom",
};

export default Calendar;
