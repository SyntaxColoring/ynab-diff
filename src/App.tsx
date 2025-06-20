import currency from "currency.js";
import React, { Key, useCallback } from "react";

import { Button } from "./components/Button";
import { Select } from "./components/Select";
import { BankTable } from "./components/tables/BankTable";
import { YNABTable } from "./components/tables/YNABTable";
import {
  Amount,
  CURRENCY_CODES,
  CurrencyCode,
  CurrencyFormatterContextProvider,
  getCurrencyFormatter,
} from "./currencyFormatting";
import { findMismatches } from "./findMismatches";
import { BankImportFlow } from "./importFlows/BankImportFlow";
import { YNABImportFlow } from "./importFlows/YNABImportFlow";
import {
  BankColumnType,
  BankTransaction,
  YNABTransaction,
} from "./importProcessing";
import { PageLayout } from "./PageLayout";
import {
  MismatchFilterState,
  useMismatchFilterState,
} from "./useMismatchFilterState";

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

  const [ynabImport, setYNABImport] = React.useState<
    | {
        status: "imported" | "reimporting";
        filename: string;
        account: string;
        transactions: AnnotatedYNABTransaction[];
      }
    | { status: "noImportYet" }
  >({ status: "noImportYet" });

  const [bankImport, setBankImport] = React.useState<
    | {
        status: "imported" | "reimporting";
        filename: string;
        transactions: AnnotatedBankTransaction[];
        columnSpecs: {
          name: string;
          type: BankColumnType;
        }[];
      }
    | { status: "noImportYet" }
  >({ status: "noImportYet" });

  const mismatches = React.useMemo(() => {
    if (
      ynabImport.status === "noImportYet" ||
      bankImport.status === "noImportYet"
    )
      return null;

    const ynabTransactionsInComparison = ynabImport.transactions.filter(
      (e) => !e.isExcludedFromComparison,
    );
    const bankTransactionsInComparison = bankImport.transactions.filter(
      (e) => !e.isExcludedFromComparison,
    );

    return findMismatches(
      ynabTransactionsInComparison.map((t) => t.transaction.outflow),
      bankTransactionsInComparison.map((t) => t.transaction.outflow),
    );
  }, [ynabImport, bankImport]);
  const mismatchCount = (mismatches ?? []).reduce(
    (acc, mismatch) => acc + Math.abs(mismatch.bankCount - mismatch.ynabCount),
    0,
  );

  const filterState = useMismatchFilterState(mismatches ?? []);

  const visibleYNABTransactions =
    filterState &&
    ynabImport.status !== "noImportYet" &&
    ynabImport.transactions.filter(
      (t) =>
        filterState.amountPassesFilter(t.transaction.outflow) &&
        (!t.isExcludedFromComparison || showingExcludedTransactions),
    );
  const visibleBankTransactions =
    filterState &&
    bankImport.status !== "noImportYet" &&
    bankImport.transactions.filter((t) => {
      return (
        filterState.amountPassesFilter(t.transaction.outflow) &&
        (!t.isExcludedFromComparison || showingExcludedTransactions)
      );
    });

  const handleYNABExcludedChange = useCallback(
    (key: Key, excluded: boolean) => {
      if (ynabImport.status !== "noImportYet" && visibleYNABTransactions) {
        // TODO: Make this not O(n).
        const indexToChange = ynabImport.transactions.findIndex(
          (t) => t.key === key,
        );
        const newYNABTransactions = [...ynabImport.transactions];
        newYNABTransactions[indexToChange] = {
          ...ynabImport.transactions[indexToChange],
          isExcludedFromComparison: excluded,
        };
        setYNABImport({ ...ynabImport, transactions: newYNABTransactions });
      }
    },
    [visibleYNABTransactions, ynabImport],
  );

  const handleBankExcludedChange = useCallback(
    (key: Key, excluded: boolean) => {
      if (bankImport.status !== "noImportYet" && visibleBankTransactions) {
        // TODO: Make this not O(n).
        const indexToChange = bankImport.transactions.findIndex(
          (t) => t.key === key,
        );
        const newBankTransactions = [...bankImport.transactions];
        newBankTransactions[indexToChange] = {
          ...bankImport.transactions[indexToChange],
          isExcludedFromComparison: excluded,
        };
        setBankImport({
          ...bankImport,
          transactions: newBankTransactions,
        });
      }
    },
    [visibleBankTransactions, bankImport],
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
    <section className="h-full">
      {ynabImport.status === "imported" ? (
        <div className="h-full flex flex-col gap-1">
          <div className="flex-0">
            <h2>
              {ynabImport.transactions.length} YNAB transactions{" "}
              <Button
                variant="secondary"
                onClick={() =>
                  setYNABImport({ ...ynabImport, status: "reimporting" })
                }
              >
                Edit
              </Button>
            </h2>
          </div>
          <div className="flex-1">
            {visibleYNABTransactions && (
              <YNABTable
                data={visibleYNABTransactions}
                onExcludedChange={handleYNABExcludedChange}
                heightMode="fillContainer"
              />
            )}
          </div>
        </div>
      ) : (
        <YNABImportFlow
          onCancel={() => {
            if (ynabImport.status === "reimporting") {
              // if-statement for type-checking. Should always pass in practice.
              setYNABImport({ ...ynabImport, status: "imported" });
            }
          }}
          showCancelButton={ynabImport.status === "reimporting"}
          onSubmit={(transactions, account, filename) => {
            setYNABImport({
              status: "imported",
              account,
              filename,
              transactions: transactions.map((transaction, index) => ({
                transaction,
                key: index,
                isExcludedFromComparison:
                  // Exclude uncleared transactions from the comparison by default
                  // because they probably won't be in the bank's export (though this can depend on the bank).
                  //
                  // Also exclude reconciled transactions by default.
                  // This is more arbitrary and I'm honestly not sure if it's right.
                  transaction.cleared !== "cleared",
              })),
            });
          }}
        />
      )}
    </section>
  );

  const bankArea = (
    <section className="h-full">
      {bankImport.status === "imported" ? (
        <div className="h-full flex flex-col gap-1">
          <div className="flex-0">
            <h2>
              {bankImport.transactions.length} Bank transactions{" "}
              <Button
                variant="secondary"
                onClick={() =>
                  setBankImport({ ...bankImport, status: "reimporting" })
                }
              >
                Edit
              </Button>
            </h2>
          </div>
          <div className="flex-1">
            {visibleBankTransactions && (
              <BankTable
                transactions={visibleBankTransactions}
                onExcludedChange={handleBankExcludedChange}
                columnSpecs={bankImport.columnSpecs}
                hideColumnTypeControls
                heightMode="fillContainer"
              />
            )}
          </div>
        </div>
      ) : (
        <BankImportFlow
          onCancel={() => {
            if (bankImport.status === "reimporting") {
              // if-statement for type-checking. Should always pass in practice.
              setBankImport({ ...bankImport, status: "imported" });
            }
          }}
          showCancelButton={bankImport.status === "reimporting"}
          onSubmit={({ filename, columnSpecs, transactions }) => {
            setBankImport({
              status: "imported",
              filename,
              columnSpecs,
              transactions: transactions.map((transaction, index) => ({
                transaction,
                key: index,
                isExcludedFromComparison: false,
              })),
            });
          }}
        />
      )}
    </section>
  );

  return (
    <CurrencyFormatterContextProvider value={currencyFormatter}>
      <PageLayout
        {...{
          headerArea,
          filterArea,
          ynabArea,
          bankArea,
        }}
      />
    </CurrencyFormatterContextProvider>
  );
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
