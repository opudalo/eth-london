import { IconProps } from "./icons";
import { SVGWrap } from "./icons/svgWrap";
import $ from "./input.module.css";
import { PropsWithCSS } from "./types";
import { Atom, F, ReadOnlyAtom, classes } from "@grammarly/focal";
import { bind } from "@grammarly/focal/dist/_cjs/src/react";

type BaseInputProps = {
  type: "text" | "number" | "search";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
};

type InputProps = PropsWithCSS<
  BaseInputProps & {
    value: Atom<string | number>;
    customValueWhenBlurred?: ReadOnlyAtom<string>;
  }
>;

export const Input: React.FC<InputProps> = ({
  customValueWhenBlurred,
  type,
  value,
  className,
  size = "medium",
  icon,
  style,
  ...other
}) => {
  const focused = Atom.create(false);

  return (
    <F.span
      {...classes(
        $.wrap,
        !!customValueWhenBlurred && $.customValue,
        focused.view(x => !!x && $.focused),
        size && $[size],
        !!icon && $.withIcon,
      )}
      style={style}
      data-content={customValueWhenBlurred}
    >
      {icon && <F.span {...classes($.icon)}>{icon}</F.span>}
      <F.input
        onFocus={() => focused.set(true)}
        onBlur={() => {
          focused.set(false);
        }}
        type={type}
        {...bind({ value })}
        {...classes($.input, className, size && $[size])}
        {...other}
      />
    </F.span>
  );
};

const SearchIcon = (props: IconProps) => (
  <SVGWrap {...props} viewBox="0 0 18 18">
    <g clipPath="url(#clip0_10907_6618)">
      <path
        d="M18.0008 16.4998L12.8608 11.3198H12.5108C13.6112 9.91622 14.1344 8.14549 13.9734 6.36922C13.8124 4.59295 12.9795 2.94511 11.6447 1.76217C10.3099 0.579239 8.57386 -0.0495654 6.79111 0.0041557C5.00837 0.0578768 3.31337 0.790071 2.05221 2.05123C0.791048 3.31239 0.0588534 5.0074 0.00513226 6.79014C-0.0485889 8.57288 0.580215 10.3089 1.76315 11.6437C2.94608 12.9785 4.59392 13.8114 6.37019 13.9724C8.14647 14.1334 9.91719 13.6102 11.3208 12.5098V12.8598L16.5008 17.9998L18.0008 16.4998ZM12.0008 6.99984C12.0008 8.32592 11.474 9.59769 10.5363 10.5354C9.59866 11.4731 8.32689 11.9998 7.00081 11.9998C5.67473 11.9998 4.40296 11.4731 3.46528 10.5354C2.5276 9.59769 2.00081 8.32592 2.00081 6.99984C2.00081 5.67375 2.5276 4.40198 3.46528 3.4643C4.40296 2.52662 5.67473 1.99984 7.00081 1.99984C8.32689 1.99984 9.59866 2.52662 10.5363 3.4643C11.474 4.40198 12.0008 5.67375 12.0008 6.99984Z"
        fill="black"
      />
    </g>
  </SVGWrap>
);

export const SearchInput: React.FC<Omit<InputProps, "type">> = props => {
  return <Input {...props} placeholder={props.placeholder || "Search…"} type="search" icon={<SearchIcon />} />;
};
