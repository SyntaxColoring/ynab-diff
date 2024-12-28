import currency from "currency.js";
import { describe, expect, it } from "vitest";
import { findMismatches } from "./findMismatches";

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
    const ynab = [
      currency("$100.00"),
      currency("$200.00"),
      currency("$300.00"),
      currency("$400.00"),
      currency("$500.00"),
    ];
    const bank = [
      currency("$100.00"),
      currency("$200.00"),
      currency("$150.00"),
      currency("$150.00"),
      currency("$400.00"),
      currency("$500.00"),
    ];
    const result = findMismatches(ynab, bank);
    expect(result).toStrictEqual([
      { amount: currency("$150.00"), ynabCount: 0, bankCount: 2 },
      { amount: currency("$300.00"), ynabCount: 1, bankCount: 0 },
    ]);
  });
  it("should match based on numeric equivalency, not string equivalency", () => {
    const ynab = [currency("$100.00"), currency("100")];
    const bank = [currency("€100.00"), currency("100 GBP")];
    const result = findMismatches(ynab, bank);
    expect(result).toStrictEqual([]);
  });
});
