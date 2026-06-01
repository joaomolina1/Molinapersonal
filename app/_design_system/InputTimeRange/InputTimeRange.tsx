import { CSSProperties, Ref, useState } from "react";
import {
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  Dialog as AriaDialog,
} from "react-aria-components";
import InputWrapper from "../_utils/InputWrapper";
import { InputSelectButton } from "../InputSelect";
import { createBEMClasses } from "@/_utils/classname";
import Button from "../Button";
import { TimeDuration } from "@/_utils/number";
import InputTimeRangeInputs from "./InputTimeRangeInputs";

export type InputTimeRangeProps = {
  label: string;
  showLabel?: boolean;
  start?: TimeDuration | null;
  end?: TimeDuration | null;
  onChange?: (start: TimeDuration | null, end: TimeDuration | null) => void;
  availableRanges?: { start: TimeDuration; end: TimeDuration }[];
  unavailableRanges?: { start: TimeDuration; end: TimeDuration }[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;

  className?: string;
  style?: CSSProperties;

  ref?: Ref<HTMLButtonElement>;
};

const { block } = createBEMClasses("callout-time-range");

const InputTimeRange = ({
  label,
  showLabel = true,
  start,
  end,
  onChange,
  availableRanges,
  unavailableRanges,
  placeholder,
  disabled,
  invalid,
  error,
  info,
  className,
  style,
  ref,
}: InputTimeRangeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasValue = !!start && !!end;
  const valueText = hasValue ? `${start.timeLabel} - ${end.timeLabel}` : "";

  const [menuStart, setMenuStart] = useState(start);
  const [menuEnd, setMenuEnd] = useState(end);

  const cancel = () => {
    setMenuStart(start);
    setMenuEnd(end);
    setIsOpen(false);
  };

  const apply = () => {
    if (!disableApply) {
      onChange?.(menuStart, menuEnd);
      setIsOpen(false);
    }
  };

  const hasChanges = menuStart?.id !== start?.id || menuEnd?.id !== end?.id;

  const disableApply = !menuStart || !menuEnd || !hasChanges;

  return (
    <AriaDialogTrigger
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setIsOpen(true);
        } else {
          if (disableApply) {
            cancel();
          } else {
            apply();
          }
        }
      }}
    >
      <InputWrapper
        className={className}
        error={error}
        info={info}
        style={style}
      >
        <InputSelectButton
          label={label}
          showLabel={showLabel}
          disabled={disabled}
          value={valueText}
          placeholder={placeholder}
          invalid={!!error || invalid}
          ref={ref}
        />
      </InputWrapper>
      <AriaPopover placement="bottom" offset={8}>
        <AriaDialog className={block()}>
          <main>
            <InputTimeRangeInputs
              start={menuStart}
              end={menuEnd}
              setStart={setMenuStart}
              setEnd={setMenuEnd}
              availableRanges={availableRanges}
              unavailableRanges={unavailableRanges}
              onReset={() => onChange?.(null, null)}
            />
          </main>
          <footer>
            <Button
              label="Aplicar"
              type="primary"
              disabled={!menuStart || !menuEnd || !hasChanges}
              onClick={apply}
            />
          </footer>
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
};

export default InputTimeRange;
