import currency from "currency.js";
import React from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCY_CODES = Intl.supportedValuesOf("currency");
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CurrencyFormatter = (amount: currency) => string;

// eslint-disable-next-line react-refresh/only-export-components
export function getCurrencyFormatter(
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

const CurrencyFormatterContext = React.createContext<CurrencyFormatter | null>(
  null,
);

export const CurrencyFormatterContextProvider =
  CurrencyFormatterContext.Provider;

export function Amount({
  amount,
  formatter,
}: {
  amount: currency;
  formatter?: CurrencyFormatter;
}): React.JSX.Element {
  const formatterFromContext = React.useContext(CurrencyFormatterContext);
  const overriddenFormatter = formatter || formatterFromContext;
  if (!overriddenFormatter)
    throw new Error("CurrencyFormatter must be provided by props or context.");
  return <>{overriddenFormatter(amount)}</>;
}
