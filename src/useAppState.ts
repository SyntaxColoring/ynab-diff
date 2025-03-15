// import { Mismatch } from "./findMismatches";
// import {
//   BankColumnType,
//   OutflowParsedBankTransaction,
//   ParseError,
//   YNABTransaction,
// } from "./importProcessing";

// export type KeyedYNABTransaction = YNABTransaction & { key: number };
// export type KeyedBankTransaction = OutflowParsedBankTransaction & {
//   key: number;
// };

// export interface AppState {
//   setYNABCSVText(csvText: string): void;
//   setBankCSVText(csvText: string): void;

//   ynabData:
//     | null
//     | ParseError
//     | {
//         allTransactions: KeyedYNABTransaction[];
//         visibleTransactions: KeyedYNABTransaction[];
//       };
//   bankData:
//     | null
//     | ParseError
//     | {
//         columnSpecs: { name: string; type: BankColumnType }[];
//         allTransactions: OutflowParsedBankTransaction[];
//         visibleTransactions: OutflowParsedBankTransaction[];
//       };

//   availableYNABAccounts: string[];
//   getSelectedYNABAccount(): string | null;
//   setSelectedYNABAccount(ynabAccount: string | null): void;

//   setYNABTransactionExcluded(
//     transactionKey: KeyedYNABTransaction["key"],
//     excluded: boolean,
//   ): void;
//   setBankTransactionExcluded(
//     transactionKey: KeyedBankTransaction["key"],
//     excluded: boolean,
//   ): void;

//   availableMismatchFilters: Mismatch[];
//   setMismatchFilterEnabled(mismatch: Mismatch, filterOut: boolean): void;
// }
