import type currency from "currency.js";

import { Amount } from "./currencyFormatting";
import { selectAmountFilters, toggleFilter } from "./redux/tablesSlice";
import { useAppDispatch, useAppSelector } from "./redux/typedHooks";

export function MismatchFiltersList(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const filters =
    useAppSelector((state) => selectAmountFilters(state.present)) ?? [];

  return (
    <ul>
      {filters.map((filter) => (
        <li key={filter.key} className="inline-block">
          <MismatchToggleButton
            amount={filter.mismatch.amount}
            count={Math.abs(
              filter.mismatch.bankCount - filter.mismatch.ynabCount,
            )}
            enabled={filter.filterEnabled}
            onClick={() => dispatch(toggleFilter({ key: filter.key }))}
          />
        </li>
      ))}
    </ul>
  );
}

function MismatchToggleButton({
  amount,
  count,
  enabled,
  onClick,
}: {
  amount: currency;
  count: number;
  enabled: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      className={enabled ? "font-bold text-blue-500" : ""}
      onClick={onClick}
    >
      <Amount amount={amount} /> ({count})
    </button>
  );
}
