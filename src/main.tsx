import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

// TODO: Pare this down to reduce bundle size.
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
