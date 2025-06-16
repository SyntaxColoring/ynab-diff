import currency from "currency.js";

import { Amount } from "../currencyFormatting";

export interface Props {
  currencyAmount: currency;
  mismatchCount: number;
  selected: boolean;
  onClick(): void;
}

export function FilterPill(props: Props): React.JSX.Element {
  const { currencyAmount, mismatchCount, selected, onClick } = props;

  const variant = selected
    ? {
        wrapper: "bg-amber-400 text-amber-950 hover:bg-amber-500 active:bg-amber-600 border-amber-700 shadow-inner",
        count: "bg-amber-500 text-amber-950 group-hover:bg-inherit group-hover:text-inherit group-active:bg-inherit group-active:text-inherit",
      }
    : {
        wrapper: "bg-stone-100 text-stone-500 hover:bg-amber-300 hover:text-amber-950 active:bg-amber-600 active:text-amber-950",
        count: "bg-stone-200 text-stone-500 group-hover:bg-inherit group-hover:text-inherit group-active:bg-inherit group-active:text-inherit",
      };

  return (
    <button
      className={`group border-2 border-transparent transition-colors rounded-full ${variant.wrapper}`}
      onClick={onClick}
    >
      {mismatchCount > 1 && <span
        className={`transition-colors inline-block min-w-[1lh] px-2 rounded-full ${variant.count}`}
      >
        {mismatchCount}x
      </span>
      }
      <span className="mx-2">
        <Amount amount={currencyAmount} />
      </span>
    </button>
  );
}
