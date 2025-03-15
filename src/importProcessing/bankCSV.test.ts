import { describe, expect, it } from "vitest";

import currency from "currency.js";

import { parseBankCSV, parseBankOutflow } from "./bankCSV";
import { BankTransaction } from "./types";

describe("parseBankCSV()", () => {
  it("should parse all fields", () => {
    const input = `\
Col A,Col B,Col C
A1,B1,C1
A2,B2,C2
A3,B3,C3
`;

    const expectedOutput: ReturnType<typeof parseBankCSV> = {
      columnNames: ["Col A", "Col B", "Col C"],
      rows: [
        ["A1", "B1", "C1"],
        ["A2", "B2", "C2"],
        ["A3", "B3", "C3"],
      ],
    };

    expect(parseBankCSV(input)).toStrictEqual(expectedOutput);
    expect(parseBankCSV(input, 2)).toStrictEqual({
      columnNames: expectedOutput.columnNames,
      rows: expectedOutput.rows.slice(0, 2),
    });
  });

  it("should tolerate input with just a header", () => {
    expect(parseBankCSV("")).toStrictEqual({ columnNames: [], rows: [] });
  });

  it("should tolerate empty input", () => {
    expect(parseBankCSV("Col A,Col B,Col C")).toStrictEqual({
      columnNames: ["Col A", "Col B", "Col C"],
      rows: [],
    });
  });
});

describe("parseBankOutflows()", () => {
  it("should parse and sum all inflow and outflow columns", () => {
    expect(
      parseBankOutflow({
        columnTypes: ["inflow", "outflow", "other"],
        row: ["$100", "$100", "$100"],
      }),
    ).toStrictEqual({
      values: [
        { type: "inflow", rawValue: "$100", amount: currency(100) },
        { type: "outflow", rawValue: "$100", amount: currency(100) },
        { type: "other", rawValue: "$100" },
      ],
      outflow: currency(0),
    } satisfies BankTransaction);

    expect(
      parseBankOutflow({
        columnTypes: ["inflow", "outflow", "other"],
        row: ["-$50.50", "-$75.50", "blah"],
      }),
    ).toStrictEqual({
      values: [
        { type: "inflow", rawValue: "-$50.50", amount: currency(-50.5) },
        { type: "outflow", rawValue: "-$75.50", amount: currency(-75.5) },
        { type: "other", rawValue: "blah" },
      ],
      outflow: currency(-25.0),
    } satisfies BankTransaction);
  });
});
