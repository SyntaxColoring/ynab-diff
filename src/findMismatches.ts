import currency from "currency.js";

export function findMismatches(
  ynabTransactionAmounts: currency[],
  bankTransactionAmounts: currency[],
): Mismatch[] {
  const possibleMismatches = new Map<number, Mismatch>();

  for (const amount of ynabTransactionAmounts) {
    const entry = createOrGet(possibleMismatches, amount.intValue, {
      amount,
      ynabCount: 0,
      bankCount: 0,
    });
    entry.ynabCount++;
  }

  for (const amount of bankTransactionAmounts) {
    const entry = createOrGet(possibleMismatches, amount.intValue, {
      amount,
      ynabCount: 0,
      bankCount: 0,
    });
    entry.bankCount++;
  }

  const mismatches = [...possibleMismatches.values()]
    .filter((m) => m.bankCount != m.ynabCount)
    .sort();
  return mismatches;
}

export interface Mismatch {
  amount: currency;
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
