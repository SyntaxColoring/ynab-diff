import currency from "currency.js";

export function findMismatches(
  ynabTransactionAmounts: TransactionAmount[],
  bankTransactionAmounts: TransactionAmount[],
): Mismatch[] {
  const possibleMismatches = new Map<number, Mismatch>();

  for (const amount of ynabTransactionAmounts) {
    const entry = createOrGet(
      possibleMismatches,
      amount.parsedAmount.intValue,
      {
        sourceString: amount.sourceString,
        parsedAmount: amount.parsedAmount,
        ynabCount: 0,
        bankCount: 0,
      },
    );
    entry.ynabCount++;
  }

  for (const amount of bankTransactionAmounts) {
    const entry = createOrGet(
      possibleMismatches,
      amount.parsedAmount.intValue,
      {
        sourceString: amount.sourceString,
        parsedAmount: amount.parsedAmount,
        ynabCount: 0,
        bankCount: 0,
      },
    );
    entry.bankCount++;
  }

  const mismatches = [...possibleMismatches.values()]
    .filter((m) => m.bankCount != m.ynabCount)
    .sort();
  return mismatches;
}

export interface TransactionAmount {
  sourceString: string; // Preserved so we don't have to guess the display format.
  parsedAmount: currency;
}

export interface Mismatch {
  sourceString: string;
  parsedAmount: currency;
  ynabCount: number;
  bankCount: number;
}

function createOrGet<K, V>(map: Map<K, V>, key: K, default_: V): V {
  const existing = map.get(key);
  if (existing === undefined) {
    map.set(key, default_);
    return default_;
  } else {
    return existing;
  }
}
