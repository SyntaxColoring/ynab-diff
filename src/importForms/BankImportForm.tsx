import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";

import { Details } from "../components/Details";
import { Button } from "../components/inputs/Button";
import { BankTable } from "../components/tables/BankTable";
import {
  parseBankCSV,
  parseBankOutflow,
  type BankColumnType,
  type BankTransaction,
} from "../importProcessing";
import { zipEqualLength } from "../zipEqualLength";
import CSVFileInput from "./CSVFileInput";
import { StepList } from "./StepList";
import { useSelectBankColumnTypes } from "./useSelectBankColumnTypes";

const PREVIEW_TRANSACTION_COUNT = 5;

export interface Result {
  filename: string;
  columnSpecs: {
    name: string;
    type: BankColumnType;
  }[];
  transactions: BankTransaction[];
}

export interface Props {
  showCancelButton: boolean;
  onSubmit: (result: Result) => void;
  onCancel: () => void;
}

export function BankImportForm(props: Props): React.JSX.Element {
  const { showCancelButton, onSubmit, onCancel } = props;

  const [file, setFile] = useState<File | null>(null);
  const parseState = useAsync(parse, [file]);

  const { selectedBankColumnTypes, setSelectedBankColumnTypes } =
    useSelectBankColumnTypes(parseState.result?.columnNames ?? null);

  const handleImportClick = useCallback(() => {
    if (
      file === null ||
      parseState.result == null ||
      selectedBankColumnTypes === null
    )
      return;
    const result: Result = {
      filename: file.name,
      columnSpecs: zipEqualLength(
        parseState.result.columnNames,
        selectedBankColumnTypes,
      ).map(([name, type]) => ({ name, type })),
      transactions: parseState.result.rows.map((row) =>
        parseBankOutflow({
          columnTypes: selectedBankColumnTypes,
          row,
        }),
      ),
    };
    onSubmit(result);
  }, [onSubmit, file, parseState.result, selectedBankColumnTypes]);

  const tableData = useMemo(() => {
    if (parseState.result == null || selectedBankColumnTypes == null)
      return null;

    const columnSpecs = zipEqualLength(
      parseState.result.columnNames,
      selectedBankColumnTypes,
    ).map(([name, type]) => ({ name, type }));
    const transactions = parseState.result.rows.map((row, index) => ({
      transaction: parseBankOutflow({
        columnTypes: selectedBankColumnTypes,
        row,
      }),
      index,
      isExcludedFromComparison: false, // Visually hidden anyway, so doesn't matter.
    }));
    const previewedTransactions = transactions.slice(
      0,
      PREVIEW_TRANSACTION_COUNT,
    );
    return { columnSpecs, transactions, previewedTransactions };
  }, [parseState.result, selectedBankColumnTypes]);

  const atLeastOneCurrencyColumnIdentified = (
    tableData?.columnSpecs ?? []
  ).some(({ type }) => type === "inflow" || type === "outflow");
  const buttonStatus =
    tableData === null
      ? { disabled: true, disabledReason: "To continue, select a file" }
      : !atLeastOneCurrencyColumnIdentified
        ? {
            disabled: true,
            disabledReason: "To continue, select an inflow or outflow column",
          }
        : { disabled: false };

  return (
    <form className="space-y-8">
      <h1>Bank</h1>

      <StepList>
        <StepList.Step number="1">
          <div className="space-y-2">
            <StepList.Step.Heading text="Export transactions from your bank or credit card" />
            <Details>
              <Details.Summary>Instructions</Details.Summary>
              <div className="mt-2 space-y-2">
                <p>
                  The exact details will depend on your institution. But
                  generally:
                </p>
                <ol className="ml-8 list-decimal space-y-2">
                  <li>
                    Look for a way to download a CSV file from pages like
                    "statements" or "transaction history."
                  </li>
                  <li>
                    Try to download the same date range that you did on the YNAB
                    side. If you can't match them exactly, err towards including
                    extra transactions on this side. You can exclude them later.
                  </li>
                </ol>
                <p>
                  The file needs to have a single header row. If it doesn't, you
                  might need to prepare it separately in a tool like Excel or
                  Google Sheets.
                </p>
              </div>
            </Details>
          </div>
        </StepList.Step>
        <StepList.Step number="2">
          <div className="space-y-2">
            <StepList.Step.Heading text="Import them here" />
            <CSVFileInput onChange={setFile} />
            <p>
              Your financial info is kept private and will not leave your
              computer.
            </p>
          </div>
        </StepList.Step>
        <StepList.Step number="3">
          <div className="space-y-2">
            <StepList.Step.Heading text="Designate column types" />
            {tableData !== null && (
              <>
                <BankTable
                  columnSpecs={tableData.columnSpecs}
                  transactions={tableData.previewedTransactions}
                  onChangeColumnTypes={setSelectedBankColumnTypes}
                  hideExclusionColumn
                  heightMode="fitContent"
                />
                <PreviewCountText
                  previewTransactionCount={
                    tableData.previewedTransactions.length
                  }
                  totalTransactionCount={tableData.transactions.length}
                />
              </>
            )}
          </div>
        </StepList.Step>
      </StepList>

      <div className="flex justify-end gap-4">
        {showCancelButton && <Button onClick={onCancel}>Cancel</Button>}
        <Button
          variant="primary"
          disabled={buttonStatus.disabled}
          title={buttonStatus.disabledReason}
          onClick={handleImportClick}
        >
          {getImportButtonText(tableData?.transactions.length)}
        </Button>
      </div>
    </form>
  );
}

async function parse(file: File | null): Promise<{
  filename: string;
  columnNames: string[];
  rows: string[][];
} | null> {
  if (file === null) return null;
  const { columnNames, rows } = parseBankCSV(await file.text());
  return { filename: file.name, columnNames, rows };
}

function getImportButtonText(transactionCount: number | undefined) {
  if (transactionCount === undefined) return "Import";
  return `Import ${transactionCount} ${transactionPlural(transactionCount)}`;
}

function PreviewCountText(props: {
  previewTransactionCount: number;
  totalTransactionCount: number;
}): React.JSX.Element {
  const { previewTransactionCount, totalTransactionCount } = props;
  if (previewTransactionCount === totalTransactionCount) return <></>;
  return (
    <i>
      Previewing {previewTransactionCount}{" "}
      {transactionPlural(previewTransactionCount)} of {totalTransactionCount}
    </i>
  );
}

function transactionPlural(count: number): string {
  if (count === 1) return "transaction";
  return "transactions";
}
