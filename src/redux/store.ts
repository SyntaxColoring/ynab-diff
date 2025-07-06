import { configureStore } from "@reduxjs/toolkit";

import { currencyFormatSlice } from "./currencyFormatSlice";
import { tablesSlice } from "./tablesSlice";

/** The root Redux store. */
export const store = configureStore({
  reducer: {
    currencyFormat: currencyFormatSlice.reducer,
    tables: tablesSlice.reducer,
  },
  devTools: {
    serialize: true,
  },
});

export type Store = typeof store;
export type RootState = ReturnType<Store["getState"]>;
export type Dispatch = Store["dispatch"];
