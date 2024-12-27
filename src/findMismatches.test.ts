import currency from "currency.js";
import { describe, expect, it } from "vitest";
import { findMismatches, TransactionAmount } from "./findMismatches";

function areCurrenciesEqual(a: unknown, b: unknown): boolean | undefined {
  if (a instanceof currency && b instanceof currency) {
    return a.intValue === b.intValue;
  } else if (a instanceof currency || b instanceof currency) {
    return false;
  } else {
    return undefined;
  }
}

expect.addEqualityTesters([areCurrenciesEqual]);

describe("findMismatches()", () => {
  it("should find differences between YNAB and bank transaction lists", () => {
    const ynab: TransactionAmount[] = [
      { sourceString: "A", parsedAmount: currency("$100.00") },
      { sourceString: "B", parsedAmount: currency("$200.00") },
      { sourceString: "C", parsedAmount: currency("$300.00") },
      { sourceString: "D", parsedAmount: currency("$400.00") },
      { sourceString: "E", parsedAmount: currency("$500.00") },
    ];
    const bank: TransactionAmount[] = [
      { sourceString: "F", parsedAmount: currency("$100.00") },
      { sourceString: "G", parsedAmount: currency("$200.00") },
      { sourceString: "H", parsedAmount: currency("$150.00") },
      { sourceString: "I", parsedAmount: currency("$150.00") },
      { sourceString: "J", parsedAmount: currency("$400.00") },
      { sourceString: "K", parsedAmount: currency("$500.00") },
    ];
    const result = findMismatches(ynab, bank);
    expect(result).toStrictEqual([
      {
        sourceString: "C",
        parsedAmount: currency("$300.00"),
        ynabCount: 1,
        bankCount: 0,
      },
      {
        sourceString: "H",
        parsedAmount: currency("$150.00"),
        ynabCount: 0,
        bankCount: 2,
      },
    ]);
  });

  it("should match based on numeric equivalency, not string equivalency", () => {
    const ynab: TransactionAmount[] = [
      { sourceString: "A", parsedAmount: currency("$100.00") },
      { sourceString: "B", parsedAmount: currency("100") },
    ];
    const bank: TransactionAmount[] = [
      { sourceString: "C", parsedAmount: currency("€100.00") },
      { sourceString: "D", parsedAmount: currency("100 GBP") },
    ];
    const result = findMismatches(ynab, bank);
    expect(result).toStrictEqual([]);
  });
});
