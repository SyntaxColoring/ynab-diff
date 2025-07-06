import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import Currency from "currency.js";
import { enableMapSet } from "immer";

import { findMismatches, type Mismatch } from "../findMismatches";
import type {
  BankColumnType,
  BankTransaction,
  YNABTransaction,
} from "../importProcessing";

type AnnotatedTransaction<T> = {
  transaction: T;
  isExcludedFromComparison: boolean;
  // We redundantly store each element's array index inside the element itself
  // because it's otherwise difficult to retrieve from ag-grid.
  index: number;
};

type AnnotatedYNABTransaction = AnnotatedTransaction<YNABTransaction>;
type AnnotatedBankTransaction = AnnotatedTransaction<BankTransaction>;

type CurrencyPrimitive = number;

function currencyToPrimitive(currency: Currency): CurrencyPrimitive {
  return currency.intValue;
}

function primitiveToCurrency(primitive: CurrencyPrimitive): Currency {
  return new Currency(primitive, { fromCents: true });
}

export interface YNABImport {
  filename: string;
  account: string;
  transactions: AnnotatedYNABTransaction[];
}

export interface BankImport {
  filename: string;
  transactions: AnnotatedBankTransaction[];
  columnSpecs: {
    name: string;
    type: BankColumnType;
  }[];
}

export interface TablesState {
  showExcludedFromComparison: boolean;

  ynab:
    | (YNABImport & {
        status: "imported" | "reimporting";
      })
    | { status: "noImportYet" };
  bank:
    | (BankImport & {
        status: "imported" | "reimporting";
      })
    | { status: "noImportYet" };

  enabledAmountFilters: Set<CurrencyPrimitive>;
}

const initialState: TablesState = {
  ynab: { status: "noImportYet" },
  bank: { status: "noImportYet" },

  showExcludedFromComparison: true,

  enabledAmountFilters: new Set(),
};

export interface Filter {
  mismatch: Mismatch;
  key: CurrencyPrimitive;
  filterEnabled: boolean;
}

enableMapSet();

export const tablesSlice = createSlice({
  name: "tables",
  initialState,

  reducers: {
    toggleShowExcludedFromComparison: (stateDraft) => {
      stateDraft.showExcludedFromComparison =
        !stateDraft.showExcludedFromComparison;
    },

    completeYNABImport: (stateDraft, action: PayloadAction<YNABImport>) => {
      stateDraft.ynab = {
        status: "imported",
        ...action.payload,
      };
    },
    completeBankImport: (stateDraft, action: PayloadAction<BankImport>) => {
      stateDraft.bank = {
        status: "imported",
        ...action.payload,
      };
    },

    beginReimport: (
      stateDraft,
      action: PayloadAction<{ side: "ynab" | "bank" }>,
    ) => {
      const toModify = stateDraft[action.payload.side];
      if (toModify.status === "imported") {
        toModify.status = "reimporting";
      }
    },

    abortReimport: (
      stateDraft,
      action: PayloadAction<{ side: "ynab" | "bank" }>,
    ) => {
      const toModify = stateDraft[action.payload.side];
      if (toModify.status === "reimporting") {
        toModify.status = "imported";
      }
    },

    toggleTransactionExclusion: (
      stateDraft,
      action: PayloadAction<{ side: "ynab" | "bank"; index: number }>,
    ) => {
      const toModify = stateDraft[action.payload.side];
      if (toModify.status !== "noImportYet") {
        const transactions = toModify.transactions;
        const index = action.payload.index;
        transactions[index].isExcludedFromComparison =
          !transactions[index].isExcludedFromComparison;
      }
    },

    toggleFilter: (
      stateDraft,
      action: PayloadAction<{ key: CurrencyPrimitive }>,
    ) => {
      const key = action.payload.key;
      if (stateDraft.enabledAmountFilters.has(key)) {
        stateDraft.enabledAmountFilters.delete(key);
      } else {
        stateDraft.enabledAmountFilters.add(key);
      }
    },
  },

  selectors: {
    /** The mismatches that should be presented to the user as togglable filters, in order. */
    selectAmountFilters: createSelector(
      (state: TablesState) =>
        state.ynab.status === "noImportYet" ? null : state.ynab.transactions,
      (state: TablesState) =>
        state.bank.status === "noImportYet" ? null : state.bank.transactions,
      (state: TablesState) => state.enabledAmountFilters,
      (
        ynabTransactions,
        bankTransactions,
        enabledAmountFilters,
      ): Filter[] | null => {
        if (ynabTransactions === null || bankTransactions === null) {
          return null;
        }

        const ynabOutflowsToCompare = ynabTransactions
          .filter((t) => !t.isExcludedFromComparison)
          .map((t) => t.transaction.outflow);
        const bankOutflowsToCompare = bankTransactions
          .filter((t) => !t.isExcludedFromComparison)
          .map((t) => t.transaction.outflow);
        const mismatches = findMismatches(
          ynabOutflowsToCompare,
          bankOutflowsToCompare,
        );

        // When a filter is enabled and the last instance of its mismatch is resolved,
        // the filter sticks around until it's disabled. This prevents the UI from changing
        // out from under the user too much.
        const fallbackMismatches = [...enabledAmountFilters.values()].map(
          (currencyPrimitive): Mismatch => ({
            amount: primitiveToCurrency(currencyPrimitive),
            ynabCount: 0,
            bankCount: 0,
          }),
        );

        const createFilterFromMismatch = (mismatch: Mismatch): Filter => ({
          key: currencyToPrimitive(mismatch.amount),
          mismatch,
          filterEnabled: enabledAmountFilters.has(
            currencyToPrimitive(mismatch.amount),
          ),
        });

        const keyValueFromFilter = (
          filter: Filter,
        ): [CurrencyPrimitive, Filter] => [filter.key, filter];

        const filtersByKey = new Map<CurrencyPrimitive, Filter>(
          [
            ...fallbackMismatches.map(createFilterFromMismatch),
            ...mismatches.map(createFilterFromMismatch),
          ].map(keyValueFromFilter),
        );
        const sortedFilters = [...filtersByKey.values()].toSorted(
          (a, b) => a.mismatch.amount.intValue - b.mismatch.amount.intValue,
        );
        return sortedFilters;
      },
    ),

    selectYNABTransactionsPassingFilter: createSelector(
      (state: TablesState) =>
        state.ynab.status === "noImportYet" ? null : state.ynab.transactions,
      (state: TablesState) => state.enabledAmountFilters,
      (state: TablesState) => state.showExcludedFromComparison,
      (ynabTransactions, enabledAmountFilters, showExcludedFromComparison) => {
        return filterTransactions(
          ynabTransactions ?? [],
          enabledAmountFilters,
          showExcludedFromComparison,
        );
      },
    ),
    selectBankTransactionsPassingFilter: createSelector(
      (state: TablesState) =>
        state.bank.status === "noImportYet" ? null : state.bank.transactions,
      (state: TablesState) => state.enabledAmountFilters,
      (state: TablesState) => state.showExcludedFromComparison,
      (bankTransactions, enabledAmountFilters, showExcludedFromComparison) => {
        return filterTransactions(
          bankTransactions ?? [],
          enabledAmountFilters,
          showExcludedFromComparison,
        );
      },
    ),
  },
});

function filterTransactions<
  T extends AnnotatedYNABTransaction | AnnotatedBankTransaction,
>(
  transactions: T[],
  enabledAmountFilters: TablesState["enabledAmountFilters"],
  showExcludedFromComparison: boolean,
): T[] {
  return transactions.filter((t) => {
    const passesAmountFilter =
      enabledAmountFilters.size === 0 ||
      enabledAmountFilters.has(currencyToPrimitive(t.transaction.outflow));
    const passesComparisonFilter =
      showExcludedFromComparison || !t.isExcludedFromComparison;
    return passesAmountFilter && passesComparisonFilter;
  });
}

export const {
  toggleShowExcludedFromComparison,
  beginReimport,
  abortReimport,
  completeYNABImport,
  completeBankImport,
  toggleFilter,
  toggleTransactionExclusion,
} = tablesSlice.actions;
export const {
  selectAmountFilters,
  selectYNABTransactionsPassingFilter,
  selectBankTransactionsPassingFilter,
} = tablesSlice.selectors;
