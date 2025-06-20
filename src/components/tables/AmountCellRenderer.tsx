import { CustomCellRendererProps } from "ag-grid-react";
import type currency from "currency.js";

import { Amount } from "../../currencyFormatting";
import { BankValue } from "../../importProcessing";

export function BankValueCellRenderer(
  props: CustomCellRendererProps<unknown, BankValue, unknown>,
): JSX.Element | null {
  const { value: bankValue } = props;
  if (bankValue == null) {
    return null;
  } else if (bankValue.type === "other") {
    return <>{bankValue.rawValue}</>;
  } else {
    return <Amount amount={bankValue.amount} />;
  }
}

export function AmountCellRenderer(
  props: CustomCellRendererProps<unknown, currency, unknown>,
): JSX.Element | null {
  const { value } = props;
  if (value == null) {
    return null;
  } else {
    return <Amount amount={value} />;
  }
}
