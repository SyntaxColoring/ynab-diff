import type { ColDef } from "ag-grid-community";
import type currency from "currency.js";

export const compareAmounts: ColDef<unknown, currency>["comparator"] = (
  a,
  b,
) => {
  if (a == null || b == null) return 0;
  else return a.subtract(b).intValue;
};
