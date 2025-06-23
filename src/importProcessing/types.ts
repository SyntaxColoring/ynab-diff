import type currency from "currency.js";

/**
 * A single YNAB transaction.
 *
 * The structure here is based on how YNAB does it in their HTTP API.
 * Presumably we'll want to support importing transactions from there,
 * at some point.
 */
export interface YNABTransaction {
  account: string;
  flag: string;
  date: string;
  payee: string;
  categoryGroup: string;
  category: string;
  memo: string;
  /** If this is a split transaction, the outflow is the total of all parts. */
  outflow: currency;
  cleared: "cleared" | "uncleared" | "reconciled";
  /**
   * If this is a split transaction, this array contains the individual parts.
   * If this is a normal transaction, this is empty.
   */
  subtransactions: YNABSubtransaction[];
}

/** A single part of a split YNAB transaction. */
export type YNABSubtransaction = Omit<
  YNABTransaction,
  "account" | "flag" | "date" | "cleared" | "subtransactions"
>;

/** A single value (i.e. table cell) from a bank CSV export. */
export type BankValue =
  | {
      type: "outflow" | "inflow";
      amount: currency;
      rawValue: string;
    }
  | {
      type: "other";
      rawValue: string;
    };

export interface BankTransaction {
  values: BankValue[];
  outflow: currency;
}

export type BankColumnType = BankValue["type"];

export class ParseError extends Error {}
