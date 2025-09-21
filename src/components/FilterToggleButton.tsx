import clsx from "clsx";
import type currency from "currency.js";
import type React from "react";

import { Amount } from "../currencyFormatting";
import styles from "./inputs/inputs.module.css";

export interface Props {
  currencyAmount: currency;
  mismatchCount: number;
  selected: boolean;
  onClick?: () => void;
}

export function FilterToggleButton(props: Props): React.JSX.Element {
  const { currencyAmount, mismatchCount, selected, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        styles.input,
        selected && (mismatchCount === 0 ? "bg-green-200" : "bg-amber-200"),
      )}
      onClick={onClick}
    >
      <span className="flex gap-2">
        <span
          className={clsx(
            "inline-block min-w-[1lh] rounded-full",
            mismatchCount === 0
              ? selected
                ? "bg-green-400"
                : "bg-green-200"
              : selected
                ? "bg-amber-400"
                : "bg-amber-200",
          )}
        >
          {mismatchCount}x
        </span>
        <span>
          <Amount amount={currencyAmount} />
        </span>
      </span>
    </button>
  );
}
