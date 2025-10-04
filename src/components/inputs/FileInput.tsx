import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import styles from "./inputs.module.css";

export type Props = ComponentPropsWithoutRef<"input">;

/** `<input type="file" ... />` with custom styling. */
export function FileInput(props: Props): React.JSX.Element {
  return (
    <input
      type="file"
      className={clsx(styles.fileInput, "file:mr-2")}
      {...props}
    />
  );
}
