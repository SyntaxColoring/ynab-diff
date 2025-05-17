import React from "react";

/**
 * Logic for the YNAB account selection dropdown.
 */
export function useSelectYNABAccount(options: string[]): {
  selection: string | null;
  setSelection: (newYNABAccount: string | null) => void;
} {
  const [selection, setSelection] = React.useState<string | null>(null);

  if (options.length === 1 && selection !== options[0]) {
    // If there's only one option, auto-select it.
    setSelection(options[0]);
  } else if (selection !== null && !options.includes(selection)) {
    // The selection was removed from the available options and there's no obvious replacement.
    // Clear the selection.
    setSelection(null);
  }

  return {
    selection,
    setSelection,
  };
}
