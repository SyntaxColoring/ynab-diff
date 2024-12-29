import currency from "currency.js";
import { parse as csvParseSync } from "csv-parse/browser/esm/sync";

export interface YNABTransaction {
  account: string;
  flag: string;
  date: string;
  payee: string;
  categoryGroup: string;
  category: string;
  memo: string;
  outflow: currency;
  cleared: "cleared" | "uncleared" | "reconciled";
  subtransactions: YNABSubtransaction[];
}

export type YNABSubtransaction = Omit<
  YNABTransaction,
  "account" | "flag" | "date" | "cleared" | "subtransactions"
>;

export class ParseError extends Error {}

const EXPECTED_YNAB_CSV_COLUMNS = [
  "Account",
  "Flag",
  "Date",
  "Payee",
  "Category Group",
  "Category",
  "Memo",
  "Outflow",
  "Inflow",
  "Cleared",
] as const;
type YNABCSVRecord = Record<(typeof EXPECTED_YNAB_CSV_COLUMNS)[number], string>;
type UnvalidatedCSVRecord = Partial<YNABCSVRecord>;

export function parseYNABCSV(
  input: string,
  numRecordLimit?: number,
): YNABTransaction[] {
  const rawRecords: YNABCSVRecord[] = csvParseSync(input, {
    columns: true, // Auto-detect the column order from the first-row column header.
    to: numRecordLimit,
    // The input is untrusted; make sure it actually has all the expected columns.
    onRecord(record: Partial<YNABCSVRecord>): YNABCSVRecord {
      validateYNABCSVColumns(record);
      return record;
    },
  });

  return Array.from(processRecords(rawRecords));
}

/**
 * If YNAB has a split transaction like this:
 *
 *     $30 "Memo 1"
 *         $10 "Memo 2"
 *         $20 "Memo 3"
 *
 * Then in the exported CSV, it will appear as a sequence of rows like this:
 *
 *     "$10","Split (1/2) Memo 2"
 *     "$20","Split (2/2) Memo 3"
 *
 * This recombines that sequence into a single $30 row so it will match the bank.
 */
function* processRecords(
  csvRecords: Iterable<YNABCSVRecord>,
): Iterable<YNABTransaction> {
  interface SubtransactionContext {
    numSubtransactionsExpected: number;
    subtransactionsSeen: {
      index: number;
      subtransaction: YNABTransaction;
    }[];
  }

  let currentSubtransactionContext: null | SubtransactionContext = null;

  function finalizeSubtransactionContext(
    context: SubtransactionContext,
  ): YNABTransaction {
    const totalOutflow = context.subtransactionsSeen.reduce(
      (prev, current) => prev.add(current.subtransaction.outflow),
      currency(0),
    );

    const subtransactions = context.subtransactionsSeen
      .sort((a, b) => a.index - b.index)
      .map((e) => {
        const subtransaction: YNABSubtransaction = {
          categoryGroup: e.subtransaction.categoryGroup,
          category: e.subtransaction.category,
          memo: e.subtransaction.memo,
          outflow: e.subtransaction.outflow,
          payee: e.subtransaction.payee,
        };
        return subtransaction;
      });

    return {
      outflow: totalOutflow,
      subtransactions: subtransactions,
      // YNAB's CSV exports only have entries for the subtransactions of a split transaction,
      // not the root. So we need to make some educated guesses for the root's fields.
      //
      // These should be the same across every subtransaction, so we can safely use the 0th one:
      account: context.subtransactionsSeen[0].subtransaction.account,
      flag: context.subtransactionsSeen[0].subtransaction.flag,
      date: context.subtransactionsSeen[0].subtransaction.date,
      cleared: context.subtransactionsSeen[0].subtransaction.cleared,
      // These, we have no reasonable way of guessing, so leave them blank:
      payee: "",
      memo: "",
      // These fundamentally don't make sense for the root:
      category: "",
      categoryGroup: "",
    };
  }

  for (const record of csvRecords) {
    const splitInfo = parseMemoForSplit(record["Memo"]);

    if (splitInfo !== null) {
      if (currentSubtransactionContext === null) {
        currentSubtransactionContext = {
          numSubtransactionsExpected: splitInfo.numSubtransactionsExpected,
          subtransactionsSeen: [],
        };
      }

      currentSubtransactionContext.subtransactionsSeen.push({
        index: splitInfo.subtransactionIndex,
        subtransaction: {
          ...ynabTransactionFromCSV(record),
          memo: splitInfo.subtransactionMemo,
        },
      });

      if (
        currentSubtransactionContext.subtransactionsSeen.length ===
        currentSubtransactionContext.numSubtransactionsExpected
      ) {
        yield finalizeSubtransactionContext(currentSubtransactionContext);
        currentSubtransactionContext = null;
      }
    } else {
      if (currentSubtransactionContext !== null) {
        // We're looking at a non-split transaction when we were still expecting to see more
        // components of a split transaction. This can happen if the CSV file was missing
        // rows from the beginning. Output the parts of the split that we have and return
        // to non-split mode.
        yield finalizeSubtransactionContext(currentSubtransactionContext);
        currentSubtransactionContext = null;
      }

      yield ynabTransactionFromCSV(record);
    }
  }

  if (currentSubtransactionContext !== null) {
    // After iterating through all records, we were left with an incomplete split transaction.
    // This can happen when rows are missing from the end (e.g. the CSV is being previewed
    // with a limited row count.) Output what we have.
    yield finalizeSubtransactionContext(currentSubtransactionContext);
  }
}

/**
 * "Split (10/20) blah blah" -> 9, 20, "blah blah"
 */
function parseMemoForSplit(memo: string): null | {
  subtransactionIndex: number;
  numSubtransactionsExpected: number;
  subtransactionMemo: string;
} {
  const pattern =
    /^Split \((?<subtransactionIndex>[0-9]+)\/(?<numSubtransactionsExpected>[0-9]+)\) ?(?<subtransactionMemo>.*)$/s;
  const match = memo.match(pattern);
  if (match) {
    const groups = match.groups!;
    return {
      subtransactionIndex: parseInt(groups.subtransactionIndex) - 1,
      numSubtransactionsExpected: parseInt(groups.numSubtransactionsExpected),
      subtransactionMemo: groups.subtransactionMemo,
    };
  } else return null;
}

/**
 * Ensure that a row parsed from a CSV file has all the columns that we expect from a YNAB export.
 */
function validateYNABCSVColumns(
  unvalidatedCSVRecord: UnvalidatedCSVRecord,
): asserts unvalidatedCSVRecord is YNABCSVRecord {
  for (const expectedColumn of EXPECTED_YNAB_CSV_COLUMNS) {
    if (typeof unvalidatedCSVRecord[expectedColumn] !== "string") {
      throw new ParseError(
        `The "${expectedColumn}" column is missing. Make sure this CSV file was exported from YNAB and try again.`,
      );
    }
  }
}

/**
 * Convert a CSV record parsed from a YNAB export into nicer types.
 */
function ynabTransactionFromCSV(csvRecord: YNABCSVRecord): YNABTransaction {
  const rawCleared = csvRecord["Cleared"];
  let cleared: YNABTransaction["cleared"];
  if (rawCleared === "Cleared") cleared = "cleared";
  else if (rawCleared === "Uncleared") cleared = "uncleared";
  else if (rawCleared === "Reconciled") cleared = "reconciled";
  else
    throw new ParseError(
      `Unrecognized value in "Cleared" column: "${rawCleared}". Make sure this CSV file was exported from YNAB and try again.`,
    );

  const outflow = currency(csvRecord["Outflow"]).subtract(csvRecord["Inflow"]);

  return {
    cleared: cleared,
    outflow: outflow,
    subtransactions: [],
    account: csvRecord["Account"],
    categoryGroup: csvRecord["Category Group"],
    category: csvRecord["Category"],
    date: csvRecord["Date"],
    flag: csvRecord["Flag"],
    memo: csvRecord["Memo"],
    payee: csvRecord["Payee"],
  };
}
