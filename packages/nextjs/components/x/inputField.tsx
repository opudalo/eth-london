import React from "react";
import styles from "./inputField.module.css";
import { F, classes } from "@grammarly/focal";

export const InputField: React.FC<{
  className?: string;
  label: string;

  children?: React.ReactNode;
}> = ({ label, children, className }) => (
  <div {...classes(styles.item, className)}>
    <F.div {...classes(styles.label)}>{label}</F.div>
    <div {...classes(styles.input)}>{children}</div>
  </div>
);
