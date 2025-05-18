import { isEqual } from "lodash";
import React from "react";

import { BankColumnType } from "../importProcessing";

/**
 * Logic for the dropdowns for selecting the column types in the bank table.
 *
 * This ensures the selections stay compatible with the columns that are actually
 * present (in case the user selects stuff but then changes the CSV file out from under us),
 * while trying to preserve the selection if the user reimports a new CSV file with the same
 * format.
 */
export function useSelectBankColumnTypes(columnNames: string[] | null): {
  selectedBankColumnTypes: BankColumnType[] | null;
  setSelectedBankColumnTypes: (
    newSelectedColumnTypes: BankColumnType[],
  ) => void;
} {
  const [selectedColumnTypes, setSelectedColumnTypes] = React.useState<
    BankColumnType[] | null
  >(null);
  const [columnsAtTimeOfSelection, setColumnsAtTimeOfSelection] =
    React.useState<string[] | null>(columnNames);

  const publicSetSelectedColumnTypes = React.useCallback(
    (newSelectedColumnTypes: BankColumnType[]) => {
      setSelectedColumnTypes(newSelectedColumnTypes);
      setColumnsAtTimeOfSelection(columnNames);
    },
    [columnNames],
  );

  let publicSelectedColumnTypes;
  if (
    columnNames !== null &&
    columnsAtTimeOfSelection !== null &&
    isEqual(columnNames, columnsAtTimeOfSelection)
  ) {
    publicSelectedColumnTypes = selectedColumnTypes;
  } else if (columnNames === null) {
    publicSelectedColumnTypes = null;
  } else {
    const defaultColumnTypes = columnNames.map((): BankColumnType => "other");
    publicSelectedColumnTypes = defaultColumnTypes;
  }

  return {
    selectedBankColumnTypes: publicSelectedColumnTypes,
    setSelectedBankColumnTypes: publicSetSelectedColumnTypes,
  };
}
