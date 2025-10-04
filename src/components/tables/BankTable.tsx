import { type ColDef, type GetRowIdFunc } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";

import {
  type BankColumnType,
  type BankTransaction,
  type BankValue,
} from "../../importProcessing";
import { BankValueCellRenderer } from "./AmountCellRenderer";
import styles from "./centerCellContents.module.css";
import {
  ComparisonCellRenderer,
  type AdditionalProps as ComparisonCellRendererProps,
} from "./ComparisonCellRenderer";
import {
  CustomHeader,
  type AdditionalProps as CustomHeaderProps,
} from "./CustomHeader";
import { theme } from "./theme";

export interface Props {
  transactions: {
    transaction: BankTransaction;
    index: number;
    isExcludedFromComparison: boolean;
  }[];
  columnSpecs: {
    name: string;
    type: BankColumnType;
  }[];
  onChangeColumnTypes?: (newColumnTypes: BankColumnType[]) => void;
  toggleExcluded?: (index: number) => void;
  hideExclusionColumn?: boolean;
  hideColumnTypeControls?: boolean;
  heightMode: "fitContent" | "fillContainer";
}

export type TData = Props["transactions"][number];

export function BankTable(props: Props): React.JSX.Element {
  const {
    transactions,
    columnSpecs,
    heightMode,
    hideColumnTypeControls,
    hideExclusionColumn,
    onChangeColumnTypes,
    toggleExcluded,
  } = props;

  const colDefs = useMemo(
    () =>
      getColDefs({
        columnSpecs,
        hideColumnTypeControls,
        hideExclusionColumn,
        onChangeColumnTypes,
        toggleExcluded,
      }),
    [
      columnSpecs,
      hideColumnTypeControls,
      hideExclusionColumn,
      onChangeColumnTypes,
      toggleExcluded,
    ],
  );

  return (
    <AgGridReact
      theme={theme}
      getRowId={getRowId}
      rowData={transactions}
      columnDefs={colDefs}
      domLayout={heightMode === "fitContent" ? "autoHeight" : "normal"}
      suppressDragLeaveHidesColumns
      enableCellTextSelection
      ensureDomOrder // For screen readers and text selection.
      autoSizeStrategy={{ type: "fitCellContents" }}
      suppressColumnVirtualisation // Interferes with fitCellContents auto-sizing.
    />
  );
}

function bankColumnIsAmount(
  columnType: BankColumnType,
): columnType is "inflow" | "outflow" {
  return columnType === "inflow" || columnType === "outflow";
}

const getRowId: GetRowIdFunc<TData> = (params) => {
  return String(params.data.index);
};

function comparator(
  a: BankValue | null | undefined,
  b: BankValue | null | undefined,
): number {
  if (a == null || b == null) {
    return 0;
  } else if (
    (a.type === "inflow" || a.type === "outflow") &&
    (b.type === "inflow" || b.type === "outflow")
  ) {
    // TODO: Deduplicate with compareAmounts.
    return a.amount.intValue - b.amount.intValue;
  } else {
    return a.rawValue.localeCompare(b.rawValue);
  }
}

function getColDefs(
  props: Pick<
    Props,
    | "columnSpecs"
    | "hideColumnTypeControls"
    | "hideExclusionColumn"
    | "onChangeColumnTypes"
    | "toggleExcluded"
  >,
) {
  const {
    columnSpecs,
    hideColumnTypeControls,
    hideExclusionColumn,
    onChangeColumnTypes,
    toggleExcluded,
  } = props;

  const indexColDef: ColDef<TData, number> = {
    colId: "index",
    headerName: "#",
    valueGetter: (params) =>
      params.data?.index != null ? params.data?.index + 1 : undefined,
    type: "numericColumn",
    headerComponentParams: {
      rightAlign: true,
    } satisfies CustomHeaderProps,
  };

  const exclusionColDef: ColDef<TData, boolean> = {
    field: "isExcludedFromComparison",
    headerName: "Comparing",
    hide: hideExclusionColumn,
    headerComponent: CustomHeader,
    headerComponentParams: {} satisfies CustomHeaderProps,
    cellRenderer: ComparisonCellRenderer,
    cellRendererParams: {
      thisSide: "bank",
      onClick: toggleExcluded,
    } satisfies ComparisonCellRendererProps,
    cellClass: styles.centerCellContents,
  };

  const dataColDefs = columnSpecs.map(
    (columnSpec, index): ColDef<TData, BankValue> => ({
      colId: index.toString(),
      headerName: columnSpec.name,
      type: bankColumnIsAmount(columnSpec.type) ? "numericColumn" : undefined,
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuOptions: hideColumnTypeControls
          ? undefined
          : [
              {
                label: "Text",
                value: "other" satisfies BankColumnType,
              },
              {
                label: "Inflow",
                value: "inflow" satisfies BankColumnType,
              },
              {
                label: "Outflow",
                value: "outflow" satisfies BankColumnType,
              },
            ],
        selectedMenuOption: columnSpec.type,
        onSelectMenuOption: (newType) => {
          const newTypes = columnSpecs.map((c) => c.type);
          newTypes[index] = newType as BankColumnType;
          onChangeColumnTypes?.(newTypes);
        },
        rightAlign: bankColumnIsAmount(columnSpec.type),
      } satisfies CustomHeaderProps,
      valueGetter: (params) => params.data?.transaction?.values[index],
      comparator,
      cellRenderer: BankValueCellRenderer,
    }),
  );

  return [indexColDef, exclusionColDef, ...dataColDefs];
}
