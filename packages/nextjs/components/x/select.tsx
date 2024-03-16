import { PropsWithChildren } from "react";
import $ from "./select.module.css";
import { PropsWithCSS } from "./types";
import { Atom, F, classes } from "@grammarly/focal";
import { bind } from "@grammarly/focal/dist/_cjs/src/react";

type SelectProps = PropsWithChildren<
  PropsWithCSS<{
    size?: "small" | "medium" | "large";
    value: Atom<string | number>;
    disabled?: boolean;
  }>
>;

export const Select: React.FC<SelectProps> = ({ children, value, className, size = "medium", disabled, style }) => (
  <F.select
    disabled={disabled}
    {...bind({ value })}
    {...classes($.select, className, size && $[size])}
    {...(style ? { style } : {})}
  >
    {children}
  </F.select>
);
