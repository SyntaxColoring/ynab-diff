import type currency from "currency.js";
import type React from "react";

import { currencyFormatSlice } from "./redux/currencyFormatSlice";
import { useAppSelector } from "./redux/typedHooks";

// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCY_CODES = Intl.supportedValuesOf("currency");
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CurrencyFormatter = (amount: currency) => string;

// eslint-disable-next-line react-refresh/only-export-components
export function createCurrencyFormatter(
  currencyCode: CurrencyCode,
): CurrencyFormatter {
  return (amount: currency): string => {
    const formatter = Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    });
    return formatter.format(amount.value);
  };
}

export function Amount({
  amount,
  formatter,
}: {
  amount: currency;
  formatter?: CurrencyFormatter;
}): React.JSX.Element {
  const globalFormatter = useAppSelector(
    currencyFormatSlice.selectors.selectCurrencyFormatter,
  );
  const overriddenFormatter = formatter || globalFormatter;
  return <>{overriddenFormatter(amount)}</>;
}
