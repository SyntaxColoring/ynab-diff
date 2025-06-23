import type currency from "currency.js";
import React from "react";

import { type Mismatch } from "./findMismatches";

export interface MismatchFilterState {
  /** The mismatches that should be presented to the user as togglable filters, in order.
   *
   * This may contain extra entries that don't correspond to anything from the input
   * array. When a filter is enabled and the last instance of its mismatch is resolved,
   * the filter sticks around until it's disabled. This prevents the UI from changing
   * out from under the user too much.
   */
  availableFilters: Filter[];

  /** Turn a filter from availableFilters on or off. */
  setFilterEnabled(filterKey: FilterKey, enabled: boolean): void;

  /** Return whether a given amount passes all the filters currently enabled. */
  amountPassesFilter(amount: currency): boolean;
}

export interface Filter {
  mismatch: Mismatch;
  key: FilterKey;
  filterEnabled: boolean;
}

export type FilterKey = number;

/**
 * @param mismatches - The mismatched transactions currently detected across accounts.
 *     Order doesn't matter, but there shouldn't be any duplicates.
 */
export function useMismatchFilterState(
  mismatches: Mismatch[],
): MismatchFilterState | null {
  const [enabledFilters, setEnabledFilters] = React.useState(
    new Map<FilterKey, currency>(),
  );

  const mismatchesByKey = new Map(
    mismatches.map((mismatch) => [keyFromMismatch(mismatch), mismatch]),
  );

  const zombieFilters: Filter[] = [...enabledFilters.entries()]
    .filter(([filterKey, _amount]) => !mismatchesByKey.has(filterKey))
    .map(([_filterKey, amount]) => ({
      mismatch: { amount, bankCount: 0, ynabCount: 0 },
      key: _filterKey,
      filterEnabled: true,
    }));

  const availableFilters: Filter[] = [...mismatchesByKey.entries()]
    .map(([key, mismatch]) => ({
      mismatch,
      key,
      filterEnabled: enabledFilters.has(key),
    }))
    .concat(zombieFilters)
    .sort(compareFilters);

  const setFilterEnabled = (filterKey: FilterKey, enabled: boolean): void => {
    const newEnabledFilters = new Map(enabledFilters.entries());
    if (enabled) {
      const mismatch = mismatchesByKey.get(filterKey);
      if (mismatch !== undefined) {
        newEnabledFilters.set(filterKey, mismatch.amount);
      }
    } else {
      newEnabledFilters.delete(filterKey);
    }
    setEnabledFilters(newEnabledFilters);
  };

  const amountPassesFilter = (amount: currency) => {
    const isAnyFilterEnabled = enabledFilters.size > 0;
    return !isAnyFilterEnabled || enabledFilters.has(keyFromAmount(amount));
  };

  return {
    availableFilters,
    setFilterEnabled,
    amountPassesFilter,
  };
}

function keyFromMismatch(mismatch: Mismatch): FilterKey {
  return keyFromAmount(mismatch.amount);
}

function keyFromAmount(amount: currency): FilterKey {
  return amount.intValue;
}

function compareFilters(a: Filter, b: Filter): number {
  return a.mismatch.amount.intValue - b.mismatch.amount.intValue;
}
