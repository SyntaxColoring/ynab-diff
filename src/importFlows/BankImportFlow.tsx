import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";

import { Button } from "../components/Button";
import { BankTable } from "../components/tables/BankTable";
import {
  BankColumnType,
  BankTransaction,
  parseBankCSV,
  parseBankOutflow,
} from "../importProcessing";
import { zipEqualLength } from "../zipEqualLength";
import CSVFileInput from "./CSVFileInput";
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

export function BankImportFlow(props: Props): React.JSX.Element {
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
      key: index,
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
    <form className="h-full flex flex-col space-y-8">
      <h1>Import CSV from Bank</h1>

      <CSVFileInput onChange={setFile} />

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
            previewTransactionCount={tableData.previewedTransactions.length}
            totalTransactionCount={tableData.transactions.length}
          />
        </>
      )}

      <div className="flex justify-end gap-4">
        {showCancelButton && (
          <Button variant="cancel" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          disabled={buttonStatus.disabled}
          disabledReason={buttonStatus.disabledReason}
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
