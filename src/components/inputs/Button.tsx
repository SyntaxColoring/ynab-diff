import clsx from "clsx";
import type React from "react";
import type { ComponentPropsWithoutRef } from "react";

import styles from "./inputs.module.css";

interface CustomProps {
  variant?: "primary" | "secondary";
}

export type Props = ComponentPropsWithoutRef<"button"> & CustomProps;

/** A button with custom styling. */
export function Button(props: Props): React.JSX.Element {
  const { variant = "secondary", ...restProps } = props;

  return (
    <button
      {...restProps}
      className={clsx(styles.input, variant === "primary" && styles.primary)}
    />
  );
}
