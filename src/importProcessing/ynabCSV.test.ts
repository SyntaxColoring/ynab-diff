import { describe, expect, it } from "vitest";

import { YNABTransaction } from "./types";
import currency from "currency.js";
import { parseYNABCSV } from "./ynabCSV";

describe("parseYNABCSV()", () => {
  it("should parse all fields", () => {
    const input = `\
"Account","Flag","Date","Payee","Category Group/Category","Category Group","Category","Memo","Outflow","Inflow","Cleared"
"Account 1","Flag 1","11/01/2024","Payee 1","Cat group 1: Cat 1","Cat group 1","💼 Cat 1","Memo 1",$11.11,$0.00,"Uncleared"
"Account 2","Flag 2","11/02/2024","Payee 2","Cat group 2: Cat 2","Cat group 2","🚇 Cat 2","Memo 2",$0.00,$22.22,"Cleared"
"Account 3","Flag 3","11/03/2024","Payee 3","Cat group 3: Cat 3","Cat group 3","🧑‍🍳 Cat 3","Memo 3",$33.33,$0.00,"Reconciled"`;

    const expectedOutput: YNABTransaction[] = [
      {
        account: "Account 1",
        flag: "Flag 1",
        date: "11/01/2024",
        payee: "Payee 1",
        categoryGroup: "Cat group 1",
        category: "💼 Cat 1",
        outflow: currency("11.11"),
        cleared: "uncleared",
        memo: "Memo 1",
        subtransactions: [],
      },
      {
        account: "Account 2",
        flag: "Flag 2",
        date: "11/02/2024",
        payee: "Payee 2",
        categoryGroup: "Cat group 2",
        category: "🚇 Cat 2",
        outflow: currency("-22.22"),
        cleared: "cleared",
        memo: "Memo 2",
        subtransactions: [],
      },
      {
        account: "Account 3",
        flag: "Flag 3",
        date: "11/03/2024",
        payee: "Payee 3",
        categoryGroup: "Cat group 3",
        category: "🧑‍🍳 Cat 3",
        outflow: currency("33.33"),
        cleared: "reconciled",
        memo: "Memo 3",
        subtransactions: [],
      },
    ];

    expect(parseYNABCSV(input)).toStrictEqual(expectedOutput);
    expect(parseYNABCSV(input, 2)).toStrictEqual(expectedOutput.slice(0, 2));
  });

  it("should parse split transactions", () => {
    const input = `\
"Account","Flag","Date","Payee","Category Group/Category","Category Group","Category","Memo","Outflow","Inflow","Cleared"
"Account 1","Flag 1","11/01/2024","Payee 1","Cat group 1: Cat 1","Cat group 1","Cat 1","Memo 1",$11.11,$0.00,"Uncleared"
"Account 2","Flag 2","11/02/2024","Payee 2.1","Cat group 2.1: Cat 2.1","Cat group 2.1","Cat 2.1","Split (1/2) Memo 2.1",$22.22,$0.00,"Cleared"
"Account 2","Flag 2","11/02/2024","Payee 2.2","Cat group 2.1: Cat 2.1","Cat group 2.2","Cat 2.2","Split (2/2) Memo 2.2",$33.33,$0.00,"Cleared"
"Account 3","Flag 3","11/03/2024","Payee 3","Cat group 3: Cat 3","Cat group 3","Cat 3","Memo 3",$44.44,$0.00,"Reconciled"`;

    const expectedOutput: YNABTransaction[] = [
      {
        account: "Account 1",
        flag: "Flag 1",
        date: "11/01/2024",
        payee: "Payee 1",
        categoryGroup: "Cat group 1",
        category: "Cat 1",
        memo: "Memo 1",
        outflow: currency("11.11"),
        cleared: "uncleared",
        subtransactions: [],
      },
      {
        account: "Account 2",
        flag: "Flag 2",
        date: "11/02/2024",
        payee: "",
        categoryGroup: "",
        category: "",
        memo: "",
        outflow: currency("55.55"),
        cleared: "cleared",
        subtransactions: [
          {
            category: "Cat 2.1",
            categoryGroup: "Cat group 2.1",
            memo: "Memo 2.1",
            outflow: currency("22.22"),
            payee: "Payee 2.1",
          },
          {
            category: "Cat 2.2",
            categoryGroup: "Cat group 2.2",
            memo: "Memo 2.2",
            outflow: currency("33.33"),
            payee: "Payee 2.2",
          },
        ],
      },
      {
        account: "Account 3",
        flag: "Flag 3",
        date: "11/03/2024",
        payee: "Payee 3",
        categoryGroup: "Cat group 3",
        category: "Cat 3",
        memo: "Memo 3",
        outflow: currency("44.44"),
        cleared: "reconciled",
        subtransactions: [],
      },
    ];

    expect(parseYNABCSV(input)).toStrictEqual(expectedOutput);
  });
});
