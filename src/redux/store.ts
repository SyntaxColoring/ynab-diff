import { combineReducers, configureStore, isPlain } from "@reduxjs/toolkit";
import currency from "currency.js";
import undoable from "redux-undo";

import { currencyFormatSlice } from "./currencyFormatSlice";
import { tablesSlice } from "./tablesSlice";

const UNDO_HISTORY_LIMIT = 50;

const rootReducer = undoable(
  combineReducers({
    currencyFormat: currencyFormatSlice.reducer,
    tables: tablesSlice.reducer,
  }),
  { limit: UNDO_HISTORY_LIMIT },
);

/** The root Redux store. */
export const store = configureStore({
  reducer: rootReducer,

  // Redux strongly recommends sticking to primitive objects. I think that guideline is dumb --
  // data structures are good and so are domain-specific types -- so, silence all the warnings
  // relating to it.
  devTools: {
    serialize: true,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        isSerializable: (value: unknown) => {
          return isPlain(value) || knownUnserializable(value);
        },
        getEntries: (value: object) => {
          return knownUnserializable(value) ? [] : Object.entries(value);
        },
      },
    });
  },
});

function knownUnserializable(value: unknown): boolean {
  return [currency, Map, Set].some((ctor) => value instanceof ctor);
}

export type Store = typeof store;
export type RootState = ReturnType<Store["getState"]>;
export type Dispatch = Store["dispatch"];
