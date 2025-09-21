import { FilterToggleButton } from "./components/FilterToggleButton";
import { selectAmountFilters, toggleFilter } from "./redux/tablesSlice";
import { useAppDispatch, useAppSelector } from "./redux/typedHooks";

export function MismatchFiltersList(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const filters =
    useAppSelector((state) => selectAmountFilters(state.present)) ?? [];

  return (
    <div className="rounded bg-well p-3">
      {filters.length === 0 ? (
        <i className="mx-auto">No filters to show</i>
      ) : (
        <menu className="scroll flex gap-3 overflow-x-auto">
          {filters.map((filter) => (
            <li key={filter.key}>
              <FilterToggleButton
                currencyAmount={filter.mismatch.amount}
                mismatchCount={Math.abs(
                  filter.mismatch.bankCount - filter.mismatch.ynabCount,
                )}
                selected={filter.filterEnabled}
                onClick={() => dispatch(toggleFilter({ key: filter.key }))}
              />
            </li>
          ))}
        </menu>
      )}
    </div>
  );
}
