import { parse as csvParseSync } from "csv-parse/browser/esm/sync";
import currency from "currency.js";

import { BankColumnType, BankTransaction, BankValue } from "./types";

export function parseBankCSV(
  input: string,
  numRecordLimit?: number,
): { columnNames: string[]; rows: string[][] } {
  const rows: string[][] = csvParseSync(input, {
    to: numRecordLimit && numRecordLimit + 1, // +1 to account for the header.
    relax_column_count_more: true,
  });
  const columnNames = rows.length ? rows[0] : [];
  // Chop off any columns that weren't in the header.
  // Some exports appear to have a trailing comma on data rows, which looks like an extra empty column.
  const dataRows = rows.slice(1).map((row) => row.slice(0, columnNames.length));
  return { columnNames, rows: dataRows };
}

export function parseBankOutflow({
  columnTypes,
  row,
}: {
  columnTypes: BankColumnType[];
  row: string[];
}): BankTransaction {
  const values = parseRowValues(columnTypes, row);
  return {
    values,
    outflow: getTotalOutflow(values),
  };
}

function parseRowValues(
  columnTypes: BankColumnType[],
  row: string[],
): BankValue[] {
  return row.map((rawValue, index) => {
    const type = columnTypes[index];
    return type === "inflow" || type === "outflow"
      ? {
          type,
          rawValue,
          amount: currency(rawValue),
        }
      : { type, rawValue };
  });
}

function getTotalOutflow(values: BankValue[]): currency {
  return values.reduce((prev, value) => {
    if (value.type === "outflow") return prev.add(value.amount);
    else if (value.type === "inflow") return prev.subtract(value.amount);
    else return prev;
  }, currency(0));
}
