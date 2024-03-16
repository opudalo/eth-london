import { PropsWithChildren } from "react";
import $ from "./select.module.css";
import { PropsWithCSS } from "./types";
import { Atom, F, classes } from "@grammarly/focal";
import { bind } from "@grammarly/focal/dist/_cjs/src/react";

const svg = (
  color: string,
) => `<svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path stroke="${color}" stroke-linecap="round" stroke-linejoin="round" d="M7.33342 4.678L4.00008 1L0.666748 4.678M0.666748 9.32L4.00008 12.998L7.33342 9.32" />
</svg>`;

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
