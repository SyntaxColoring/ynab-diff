import { describe, expect, it } from "vitest";

import currency from "currency.js";
import { ParsedBankCSV } from "./types";
import { parseBankCSV } from "./bankCSV";

describe("parseYNABCSV()", () => {
  it("should parse all fields", () => {
    const input = `\
Col A,Col B,Col C
A1,B1,C1
A2,B2,C2
A3,B3,C3
`;

    const expectedOutput: ParsedBankCSV = {
      header: ["Col A", "Col B", "Col C"],
      transactions: [
        {
          outflow: currency(0),
          rawValues: {
            "Col A": "A1",
            "Col B": "B1",
            "Col C": "C1",
          },
        },
        {
          outflow: currency(0),
          rawValues: {
            "Col A": "A2",
            "Col B": "B2",
            "Col C": "C2",
          },
        },
        {
          outflow: currency(0),
          rawValues: {
            "Col A": "A3",
            "Col B": "B3",
            "Col C": "C3",
          },
        },
      ],
    };

    expect(parseBankCSV(input, new Set(), new Set())).toStrictEqual(
      expectedOutput,
    );
    expect(parseBankCSV(input, new Set(), new Set(), 2)).toStrictEqual({
      header: expectedOutput.header,
      transactions: expectedOutput.transactions.slice(0, 2),
    });
  });

  it("should parse inflow and outflow columns as currency and add them up", () => {
    const input = `\
Inflow,Outflow,More outflow
$100,$100,$1
$50,$75,$0
$75,$50,$0
`;

    const expectedOutput: ParsedBankCSV = {
      header: ["Inflow", "Outflow", "More outflow"],
      transactions: [
        {
          outflow: currency("1"),
          rawValues: { Inflow: "$100", Outflow: "$100", "More outflow": "$1" },
        },
        {
          outflow: currency("25"),
          rawValues: { Inflow: "$50", Outflow: "$75", "More outflow": "$0" },
        },
        {
          outflow: currency("-25"),
          rawValues: { Inflow: "$75", Outflow: "$50", "More outflow": "$0" },
        },
      ],
    };

    expect(
      parseBankCSV(
        input,
        new Set(["Inflow"]),
        new Set(["Outflow", "More outflow"]),
      ),
    ).toStrictEqual(expectedOutput);
  });

  it.each([
    "",
    "Col A,Col B,Col C\n", // Header but no column data.
  ])("should tolerate empty input: %j", (input) => {
    const expectedOutput: ParsedBankCSV = {
      header: [], // The "header but no column data" case could have something here in the future.
      transactions: [],
    };

    expect(parseBankCSV(input, new Set(), new Set())).toStrictEqual(
      expectedOutput,
    );
  });
});
