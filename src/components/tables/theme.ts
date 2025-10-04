import { themeQuartz } from "ag-grid-community";

/**
 * A custom theme for our ag-grid tables, to follow Tailwind atoms.
 */
export const theme = themeQuartz.withParams({
  backgroundColor: "var(--color-well)",
  headerBackgroundColor: "var(--color-well)",
  borderRadius: "var(--radius-sm)",
  wrapperBorderRadius: "var(--radius-md)",
  accentColor: "var(--color-green-800)",
  headerHeight: 64, // Increased to be tall enough for the column type selector.
});
