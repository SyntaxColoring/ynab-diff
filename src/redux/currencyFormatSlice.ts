import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  createCurrencyFormatter,
  type CurrencyCode,
} from "../currencyFormatting";

const initialState: CurrencyCode = "USD";

export const currencyFormatSlice = createSlice({
  name: "currencyFormat",
  initialState,
  reducers: {
    setCurrencyFormat: (_state, action: PayloadAction<CurrencyCode>) =>
      action.payload,
  },
  selectors: {
    selectCurrencyFormatter: createSelector(
      (state: CurrencyCode) => state,
      (currencyCode) => createCurrencyFormatter(currencyCode),
    ),
  },
});

export const { setCurrencyFormat } = currencyFormatSlice.actions;
