import React, { PropsWithChildren } from "react";
import Link from "next/link";
import { PropsWithCSS } from "../types";
import $ from "./button.module.css";
import { F, ReadOnlyAtom, classes } from "@grammarly/focal";

type BaseButtonProps = PropsWithChildren<
  PropsWithCSS<{
    size?: "small" | "medium" | "large";
    variation?: "default" | "borderless" | "outline" | "accent";
    type?: "submit" | "button" | "reset";
    disabled?: boolean | ReadOnlyAtom<boolean>;
  }>
>;

type ButtonProps = BaseButtonProps & {
  onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  size = "medium",
  variation = "default",
  onClick,
  type,
  disabled,
  style,
}) => {
  const opts: {
    type?: BaseButtonProps["type"];
    onClick?: () => void;
  } = {};

  if (!!type) opts.type = type;
  if (!!onClick) opts.onClick = onClick;
  return (
    <F.button
      {...opts}
      {...classes($.button, className, $[size], $[variation])}
      {...(!!style ? { style } : {})}
      disabled={disabled}
      data-disabled={disabled}
    >
      {children}
    </F.button>
  );
};

export const IconButton: React.FC<ButtonProps> = props => {
  return <Button {...props} variation={props.variation || "outline"} {...classes($.icon, props.className)} />;
};

type LinkButtonProps = BaseButtonProps & {
  href: string;
  target?: "_blank" | "_self";
  download?: string;
};
export const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  children,
  target = "_blank",
  className,
  size = "medium",
  variation = "borderless",
  download,
  style,
}) => {
  return (
    <Link
      href={href}
      {...classes($.link, $.button, className, $[size], $[variation])}
      target={target}
      {...(!!download ? { download } : {})}
      {...(!!style ? { style: style } : {})}
    >
      {children}
    </Link>
  );
};
