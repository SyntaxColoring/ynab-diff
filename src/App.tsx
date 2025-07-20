import { createSelector } from "@reduxjs/toolkit";

import { Button } from "./components/Button";
import { BankTable } from "./components/tables/BankTable";
import { YNABTable } from "./components/tables/YNABTable";
import { Header } from "./Header";
import { BankImportFlow } from "./importForms/BankImportFlow";
import { YNABImportFlow } from "./importForms/YNABImportFlow";
import { MismatchFiltersList } from "./MismatchFiltersList";
import { PageLayout } from "./PageLayout";
import {
  abortReimport,
  beginReimport,
  completeBankImport,
  completeYNABImport,
  selectAmountFilters,
  selectBankTransactionsPassingFilter,
  selectYNABTransactionsPassingFilter,
  toggleShowExcludedFromComparison,
  toggleTransactionExclusion,
} from "./redux/tablesSlice";
import { useAppDispatch, useAppSelector } from "./redux/typedHooks";

export default function App(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const ynabImport = useAppSelector((state) => state.present.tables.ynab);
  const bankImport = useAppSelector((state) => state.present.tables.bank);

  const visibleYNABTransactions = useAppSelector((state) =>
    selectYNABTransactionsPassingFilter(state.present),
  );
  const visibleBankTransactions = useAppSelector((state) =>
    selectBankTransactionsPassingFilter(state.present),
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
                onClick={() => dispatch(beginReimport({ side: "ynab" }))}
              >
                Edit
              </Button>
            </h2>
          </div>
          <div className="flex-1">
            {visibleYNABTransactions && (
              <YNABTable
                data={visibleYNABTransactions}
                toggleExcluded={(index) =>
                  dispatch(toggleTransactionExclusion({ side: "ynab", index }))
                }
                heightMode="fillContainer"
              />
            )}
          </div>
        </div>
      ) : (
        <YNABImportFlow
          onCancel={() => dispatch(abortReimport({ side: "ynab" }))}
          showCancelButton={ynabImport.status === "reimporting"}
          onSubmit={(transactions, account, filename) => {
            dispatch(
              completeYNABImport({
                account,
                filename,
                transactions: transactions.map((transaction, index) => ({
                  transaction,
                  index,
                  isExcludedFromComparison:
                    // Exclude uncleared transactions from the comparison by default
                    // because they probably won't be in the bank's export (though this can depend on the bank).
                    //
                    // Also exclude reconciled transactions by default.
                    // This is more arbitrary and I'm honestly not sure if it's right.
                    transaction.cleared !== "cleared",
                })),
              }),
            );
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
                onClick={() => dispatch(beginReimport({ side: "bank" }))}
              >
                Edit
              </Button>
            </h2>
          </div>
          <div className="flex-1">
            {visibleBankTransactions && (
              <BankTable
                transactions={visibleBankTransactions}
                toggleExcluded={(index) =>
                  dispatch(toggleTransactionExclusion({ side: "bank", index }))
                }
                columnSpecs={bankImport.columnSpecs}
                hideColumnTypeControls
                heightMode="fillContainer"
              />
            )}
          </div>
        </div>
      ) : (
        <BankImportFlow
          onCancel={() => dispatch(abortReimport({ side: "bank" }))}
          showCancelButton={bankImport.status === "reimporting"}
          onSubmit={({ filename, columnSpecs, transactions }) => {
            dispatch(
              completeBankImport({
                filename,
                columnSpecs,
                transactions: transactions.map((transaction, index) => ({
                  transaction,
                  index,
                  isExcludedFromComparison: false,
                })),
              }),
            );
          }}
        />
      )}
    </section>
  );

  return (
    <PageLayout
      headerArea={<Header />}
      filterArea={<FilterAreaContents />}
      {...{
        ynabArea,
        bankArea,
      }}
    />
  );
}

function FilterAreaContents(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const mismatchCount = useAppSelector((state) =>
    selectMismatchCount(state.present),
  );
  const showingExcludedTransactions = useAppSelector(
    (state) => state.present.tables.showExcludedFromComparison,
  );

  return (
    <>
      <section className="col-span-2">
        <h2>
          {mismatchCount} mismatched{" "}
          {mismatchCount == 1 ? "transaction" : "transactions"}
        </h2>
        <MismatchFiltersList />
      </section>

      <section className="col-span-2">
        <label>
          Show excluded transactions
          <input
            type="checkbox"
            checked={showingExcludedTransactions}
            onChange={() => dispatch(toggleShowExcludedFromComparison())}
          />
        </label>
      </section>
    </>
  );
}

const selectMismatchCount = createSelector(selectAmountFilters, (filters) => {
  return (filters ?? [])
    .map((filter) =>
      Math.abs(filter.mismatch.bankCount - filter.mismatch.ynabCount),
    )
    .reduce((acc, n) => acc + n, 0);
});
