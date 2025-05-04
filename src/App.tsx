import React, { useCallback } from "react";
import {
  Amount,
  CURRENCY_CODES,
  CurrencyCode,
  CurrencyFormatterContextProvider,
  getCurrencyFormatter,
} from "./currencyFormatting";
import {
  parseBankCSV,
  parseBankOutflow,
  ParseError,
  parseYNABCSV,
  YNABTransaction,
  BankTransaction,
  BankColumnType,
} from "./importProcessing";
import { YNABTable } from "./tables/YNABTable";
import { BankTable } from "./tables/BankTable";
import { Select } from "./Select";
import { findMismatches } from "./findMismatches";

import currency from "currency.js";
import { useSelectYNABAccount } from "./useSelectYNABAccount";
import { useSelectBankColumnTypes } from "./useSelectBankColumnTypes";
import { zipEqualLength } from "./zipEqualLength";
import {
  MismatchFilterState,
  useMismatchFilterState,
} from "./useMismatchFilterState";
import { PageLayout } from "./PageLayout";

type AnnotatedTransaction<T> = {
  transaction: T;
  key: React.Key;
  isExcludedFromComparison: boolean;
};

type AnnotatedYNABTransaction = AnnotatedTransaction<YNABTransaction>;
type AnnotatedBankTransaction = AnnotatedTransaction<BankTransaction>;

export default function App(): React.JSX.Element {
  const [currencyCode, setCurrencyCode] = React.useState<CurrencyCode>("USD");
  const currencyFormatter = React.useMemo(
    () => getCurrencyFormatter(currencyCode),
    [currencyCode],
  );

  const [showingExcludedTransactions, setShowingExcludedTransactions] =
    React.useState<boolean>(true);

  const [ynabTransactions, setYNABTransactions] = React.useState<
    AnnotatedYNABTransaction[] | null
  >(null);
  const [bankTransactionStrings, setBankTransactionStrings] = React.useState<{
    columnNames: string[];
    rows: AnnotatedTransaction<string[]>[];
  } | null>(null);

  const availableYNABAccounts = useMentionedYNABAccounts(
    ynabTransactions ?? [],
  );
  const {
    selection: selectedYNABAccount,
    setSelection: setSelectedYNABAccount,
  } = useSelectYNABAccount(availableYNABAccounts);

  const { selectedBankColumnTypes, setSelectedBankColumnTypes } =
    useSelectBankColumnTypes(
      bankTransactionStrings !== null
        ? bankTransactionStrings.columnNames
        : null,
    );

  const bankData: {
    columnSpecs: {
      name: string;
      type: BankColumnType;
    }[];
    transactions: AnnotatedBankTransaction[];
  } | null = React.useMemo(() => {
    if (bankTransactionStrings === null || selectedBankColumnTypes === null)
      return null;

    return {
      columnSpecs: zipEqualLength(
        bankTransactionStrings.columnNames,
        selectedBankColumnTypes,
      ).map(([name, type]) => ({ name, type })),

      transactions: bankTransactionStrings.rows.map((row) => ({
        ...row,
        transaction: parseBankOutflow({
          columnTypes: selectedBankColumnTypes,
          row: row.transaction,
        }),
      })),
    };
  }, [bankTransactionStrings, selectedBankColumnTypes]);

  // The YNAB account selection doesn't change very often.
  // Pre-filter on it and memoize the result so downstream
  // processing has less to go through.
  const ynabTransactionsInAccount = React.useMemo(
    () =>
      ynabTransactions === null || selectedYNABAccount === null
        ? null
        : ynabTransactions.filter(
            (t) => t.transaction.account === selectedYNABAccount,
          ),
    [ynabTransactions, selectedYNABAccount],
  );

  const mismatches = React.useMemo(() => {
    if (ynabTransactionsInAccount === null || bankData === null) return null;

    const ynabTransactionsInComparison = ynabTransactionsInAccount.filter(
      (e) => !e.isExcludedFromComparison,
    );
    const bankTransactionsInComparison = bankData.transactions.filter(
      (e) => !e.isExcludedFromComparison,
    );

    return findMismatches(
      ynabTransactionsInComparison.map((t) => t.transaction.outflow),
      bankTransactionsInComparison.map((t) => t.transaction.outflow),
    );
  }, [ynabTransactionsInAccount, bankData]);
  const mismatchCount = (mismatches ?? []).reduce(
    (acc, mismatch) => acc + Math.abs(mismatch.bankCount - mismatch.ynabCount),
    0,
  );

  const filterState = useMismatchFilterState(mismatches ?? []);

  const visibleYNABTransactions =
    filterState &&
    ynabTransactionsInAccount &&
    ynabTransactionsInAccount.filter(
      (t) =>
        filterState.amountPassesFilter(t.transaction.outflow) &&
        (!t.isExcludedFromComparison || showingExcludedTransactions),
    );
  const visibleBankTransactions =
    filterState &&
    bankData &&
    bankData.transactions.filter((t) => {
      return (
        filterState.amountPassesFilter(t.transaction.outflow) &&
        (!t.isExcludedFromComparison || showingExcludedTransactions)
      );
    });

  const handleYNABExcludedChange = useCallback(
    (indexInVisible: number, excluded: boolean) => {
      if (ynabTransactions && visibleYNABTransactions) {
        // These non-null assertions should be OK because it's impossible for
        // this handler to be called unless there are transactions to click.
        const key = visibleYNABTransactions[indexInVisible].key;
        // TODO: Make this not O(n).
        const indexToChange = ynabTransactions.findIndex((t) => t.key === key);
        const newYNABTransactions = [...ynabTransactions];
        newYNABTransactions[indexToChange] = {
          ...ynabTransactions[indexToChange],
          isExcludedFromComparison: excluded,
        };
        setYNABTransactions(newYNABTransactions);
      }
    },
    [visibleYNABTransactions, ynabTransactions],
  );

  const handleBankExcludedChange = useCallback(
    (indexInVisible: number, excluded: boolean) => {
      if (bankTransactionStrings && visibleBankTransactions) {
        const key = visibleBankTransactions[indexInVisible].key;
        // TODO: Make this not O(n).
        const indexToChange = bankTransactionStrings.rows.findIndex(
          (t) => t.key === key,
        );
        const newBankStringRows = [...bankTransactionStrings.rows];
        newBankStringRows[indexToChange] = {
          ...bankTransactionStrings.rows[indexToChange],
          isExcludedFromComparison: excluded,
        };
        setBankTransactionStrings({
          ...bankTransactionStrings,
          rows: newBankStringRows,
        });
      }
    },
    [bankTransactionStrings, visibleBankTransactions],
  );

  const headerArea = (
    // TODO: Title, about, contact, and stuff currency dropdown into a settings dialog
    <div className="text-right">
      <label>
        Currency format
        <Select
          options={CURRENCY_CODES}
          value={currencyCode}
          onChange={setCurrencyCode}
        />
      </label>
    </div>
  );

  const ynabImportArea = (
    <section>
      <h2>Import from YNAB</h2>
      <label>
        Import CSV file
        <input
          type="file"
          accept="text/csv,.csv"
          onChange={async (event) => {
            const file = event.target.files?.item(0);
            if (file) {
              try {
                setYNABTransactions(
                  parseYNABCSV(await file.text()).map((transaction, i) => ({
                    transaction,
                    key: i,
                    isExcludedFromComparison:
                      // Exclude uncleared transactions from the comparison by default
                      // because they probably won't be in the bank's export (though this can depend on the bank).
                      //
                      // Also exclude reconciled transactions by default.
                      // This is more arbitrary and I'm honestly not sure if it's right.
                      transaction.cleared !== "cleared",
                  })),
                );
              } catch (e) {
                // TODO: Better Error handling.
                if (e instanceof ParseError) {
                  setYNABTransactions(null);
                } else throw e;
              }
            }
          }}
        />
      </label>
      <label>
        Account
        <Select
          options={[
            { label: "Select...", value: "" },
            ...(availableYNABAccounts ?? []),
          ]}
          value={selectedYNABAccount ?? ""}
          onChange={(value) =>
            setSelectedYNABAccount(value === "" ? null : value)
          }
        />
      </label>
    </section>
  );

  const bankImportArea = (
    <section>
      <h2>Import from bank</h2>
      <label>
        Import CSV file
        <input
          type="file"
          accept="text/csv,.csv"
          onChange={async (event) => {
            const file = event.target.files?.item(0);
            if (file) {
              try {
                const parseResult = parseBankCSV(await file.text());
                setBankTransactionStrings({
                  columnNames: parseResult.columnNames,
                  rows: parseResult.rows.map((row, index) => ({
                    transaction: row,
                    key: index,
                    isExcludedFromComparison: false,
                  })),
                });
              } catch (e) {
                // TODO: Better error handling.
                if (e instanceof ParseError) setBankTransactionStrings(null);
                else throw e;
              }
            }
          }}
        />
      </label>
    </section>
  );

  const filterArea = (
    <>
      {filterState !== null && (
        <section className="col-span-2">
          <h2>
            {mismatchCount} mismatched{" "}
            {mismatchCount == 1 ? "transaction" : "transactions"}
          </h2>
          <MismatchFiltersList {...filterState} />
        </section>
      )}

      <section className="col-span-2">
        <label>
          Show excluded transactions
          <input
            type="checkbox"
            checked={showingExcludedTransactions}
            onChange={(e) => setShowingExcludedTransactions(e.target.checked)}
          />
        </label>
      </section>
    </>
  );

  const ynabArea = (
    <section>
      <h2>{ynabTransactionsInAccount?.length || 0} YNAB transactions</h2>
      {visibleYNABTransactions && (
        <YNABTable
          data={visibleYNABTransactions}
          onExcludedChange={handleYNABExcludedChange}
        />
      )}
    </section>
  );

  const bankArea = (
    <section>
      <h2>{bankData?.transactions.length || 0} Bank transactions</h2>
      {bankData && visibleBankTransactions && selectedBankColumnTypes && (
        <BankTable
          transactions={visibleBankTransactions}
          columnSpecs={bankData.columnSpecs}
          onChangeColumnTypes={setSelectedBankColumnTypes}
          onExcludedChange={handleBankExcludedChange}
        />
      )}
    </section>
  );

  return (
    <CurrencyFormatterContextProvider value={currencyFormatter}>
      <PageLayout
        {...{
          headerArea,
          ynabImportArea,
          bankImportArea,
          filterArea,
          ynabArea,
          bankArea,
        }}
      />
    </CurrencyFormatterContextProvider>
  );
}

function useMentionedYNABAccounts(
  transactions: AnnotatedYNABTransaction[],
): string[] {
  return React.useMemo(() => {
    const uniqueAccounts = new Set(
      transactions.map((t) => t.transaction.account),
    );
    const collator = Intl.Collator();
    return [...uniqueAccounts].sort(collator.compare);
  }, [transactions]);
}

function MismatchFiltersList(props: MismatchFilterState): React.JSX.Element {
  return (
    <ul>
      {props.availableFilters.map((m) => (
        <li key={m.key} className="inline-block">
          <MismatchToggleButton
            amount={m.mismatch.amount}
            count={Math.abs(m.mismatch.bankCount - m.mismatch.ynabCount)}
            enabled={m.filterEnabled}
            onChange={(enabled) => props.setFilterEnabled(m.key, enabled)}
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
  onChange,
}: {
  amount: currency;
  count: number;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}): React.JSX.Element {
  return (
    <button
      className={enabled ? "font-bold text-blue-500" : ""}
      onClick={() => onChange(!enabled)}
    >
      <Amount amount={amount} /> ({count})
    </button>
  );
}
