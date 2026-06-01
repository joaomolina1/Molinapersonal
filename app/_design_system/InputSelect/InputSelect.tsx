import {
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { createBEMClasses } from "@/_utils/classname";
import {
  Button as AriaButton,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import InputWrapper from "../_utils/InputWrapper";
import Stack from "../Stack";
import IconUserInterfaceNavigationArrowDown from "../_icons/UserInterface/Navigation/ArrowDown.svg";
import Dropdown, { DropdownOption } from "./Dropdown";

export type InputSelectProps<T> = {
  label: string;
  showLabel?: boolean;
  leftIcon?: ReactNode;
  value?: T;
  onChange?: (id: T) => void;
  placeholder?: string;
  options: readonly (DropdownOption<T> & { selectedText?: ReactNode })[];
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;

  className?: string;
  style?: CSSProperties;

  ref?: RefObject<HTMLButtonElement | null>;
};

function InputSelect<T extends string>({
  label,
  showLabel = true,
  leftIcon,
  value,
  onChange,
  placeholder,
  options,
  disabled,
  invalid,
  error,
  info,
  className,
  style,
  ref: propRef,
}: InputSelectProps<T>) {
  const selectedOption = options.find((option) => option.id === value);

  const innerRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number>();

  const ref = propRef || innerRef;

  useEffect(() => {
    if (ref?.current) {
      setWidth(ref.current?.getBoundingClientRect().width);
    }
  }, [ref]);

  return (
    <AriaMenuTrigger>
      <InputWrapper
        className={className}
        error={error}
        info={info}
        style={style}
      >
        <InputSelectButton
          label={label}
          showLabel={showLabel}
          leftIcon={leftIcon}
          disabled={disabled}
          value={selectedOption?.selectedText ?? selectedOption?.text}
          placeholder={placeholder}
          invalid={!!error || invalid}
          ref={ref}
        />
      </InputWrapper>
      <AriaPopover style={{ minWidth: width }} placement="bottom" offset={4}>
        <Dropdown
          ariaLabel={`Opções para ${label}`}
          options={options}
          onClickOption={onChange}
          value={value}
        />
      </AriaPopover>
    </AriaMenuTrigger>
  );
}

export type InputSelectButtonProps = {
  label: string;
  showLabel?: boolean;
  leftIcon?: ReactNode;
  disabled?: boolean;
  value?: ReactNode;
  placeholder?: string;
  invalid?: boolean;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

const { block, element } = createBEMClasses("input-select");

export const InputSelectButton = ({
  label,
  showLabel,
  leftIcon,
  disabled,
  value,
  placeholder,
  invalid,
  ref,
  className,
}: InputSelectButtonProps) => {
  return (
    <AriaButton
      aria-label={label}
      className={block(
        {
          disabled,
          error: invalid,
          "with-value": !!value,
          "with-placeholder": !value && !!placeholder,
        },
        className,
      )}
      isDisabled={disabled}
      ref={ref}
    >
      {leftIcon}
      <Stack
        alignItems="flex-start"
        justifyContent="center"
        style={{ width: "100%" }}
      >
        {showLabel && <span className={element("label")}>{label}</span>}
        {!!value && <div className={element("value")}>{value}</div>}
        {!value && !!placeholder && (
          <p className={element("placeholder")}>{placeholder}</p>
        )}
      </Stack>
      <IconUserInterfaceNavigationArrowDown style={{ fontSize: "1.25rem" }} />
    </AriaButton>
  );
};

export default InputSelect;
