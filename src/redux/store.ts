import { configureStore } from "@reduxjs/toolkit";

import { currencyFormatReducer } from "./currencyFormatSlice";

export const store = configureStore({
  reducer: {
    currencyFormat: currencyFormatReducer,
  },
});

export type Store = typeof store;
export type RootState = ReturnType<Store["getState"]>;
export type Dispatch = Store["dispatch"];
