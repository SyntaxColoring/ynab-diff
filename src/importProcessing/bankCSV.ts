import currency from "currency.js";
import { parse as csvParseSync } from "csv-parse/browser/esm/sync";
import { BankTransaction, ParsedBankCSV } from "./types";

export function parseBankCSV(
  input: string,
  inflowColumns: Set<string>,
  outflowColumns: Set<string>,
  numRecordLimit?: number,
): ParsedBankCSV {
  const transactions: BankTransaction[] = csvParseSync(input, {
    columns: true,
    to: numRecordLimit,
    onRecord(rawRecord: Record<string, string>): BankTransaction {
      const outflow = [...outflowColumns.values()].reduce(
        (prevOutflow, columnName) =>
          prevOutflow.add(rawRecord[columnName] || 0),
        currency(0),
      );
      const inflow = [...inflowColumns.values()].reduce(
        (prevInflow, columnName) => prevInflow.add(rawRecord[columnName] || 0),
        currency(0),
      );
      return {
        outflow: outflow.subtract(inflow),
        rawValues: rawRecord,
      };
    },
  });

  const header = transactions.length
    ? Object.getOwnPropertyNames(transactions[0].rawValues)
    : [];

  return { header, transactions };
}
