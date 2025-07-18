import {
  CellStyleModule,
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  ExternalFilterModule,
  ModuleRegistry,
  RowAutoHeightModule,
  RowStyleModule,
  TooltipModule,
  ValidationModule,
} from "ag-grid-community";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.tsx";
import { store } from "./redux/store.ts";

ModuleRegistry.registerModules([
  CellStyleModule,
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  ExternalFilterModule,
  RowAutoHeightModule,
  RowStyleModule,
  TooltipModule,
]);
if (import.meta.env.MODE === "development") {
  console.debug("Loading ag-grid validation module.");
  ModuleRegistry.registerModules([ValidationModule]);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
