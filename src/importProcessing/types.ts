import currency from "currency.js";

// The YNAB transaction/subtransaction structure here is based on
// how they do it in their HTTP API. Presumably we'll want to
// support importing transactions from there, at some point.
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

export interface ParsedBankCSV {
  header: string[];
  transactions: BankTransaction[];
}

export interface BankTransaction {
  rawValues: Record<string, string>;
  outflow: currency;
}

export class ParseError extends Error {}
