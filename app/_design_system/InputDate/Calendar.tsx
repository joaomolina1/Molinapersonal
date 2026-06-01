import { createBEMClasses } from "@/_utils/classname";
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  Heading as AriaHeading,
} from "react-aria-components";
import {
  CalendarDate,
  isToday,
  getLocalTimeZone,
} from "@internationalized/date";
import { IconButton } from "../Button";
import IconUserInterfaceNavigationArrowLeft from "../_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "../_icons/UserInterface/Navigation/ArrowRight.svg";

const { block, element } = createBEMClasses("calendar");

type CalendarProps = {
  value?: CalendarDate | null;
  onChange?: (value: CalendarDate) => void;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  withHeaderBorder?: boolean;
};

const Calendar = ({
  value,
  onChange,
  min,
  max,
  isDateUnavailable,
  withHeaderBorder,
}: CalendarProps) => {
  return (
    <AriaCalendar
      className={block()}
      value={value}
      onChange={onChange}
      minValue={min}
      maxValue={max}
      isDateUnavailable={
        isDateUnavailable
          ? (date) => isDateUnavailable(date as CalendarDate)
          : undefined
      }
    >
      <CalendarHeader withBorder={withHeaderBorder} />
      <AriaCalendarGrid weekdayStyle="narrow">
        {(date) => (
          <AriaCalendarCell
            date={date}
            className={element("day", {
              today: isToday(date, getLocalTimeZone()),
            })}
          />
        )}
      </AriaCalendarGrid>
    </AriaCalendar>
  );
};

const { block: headerBlock } = createBEMClasses("calendar-header");

export const CalendarHeader = ({ withBorder }: { withBorder?: boolean }) => (
  <header className={headerBlock({ withBorder })}>
    <IconButton
      icon={<IconUserInterfaceNavigationArrowLeft />}
      slot="previous"
      ariaLabel="Mês anterior"
    />
    <AriaHeading />
    <IconButton
      icon={<IconUserInterfaceNavigationArrowRight />}
      slot="next"
      ariaLabel="Mês seguinte"
    />
  </header>
);

export default Calendar;
