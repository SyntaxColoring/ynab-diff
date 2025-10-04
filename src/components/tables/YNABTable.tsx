import { type ColDef, type GetRowIdFunc } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type currency from "currency.js";
import { useMemo } from "react";
import type React from "react";

import { type YNABTransaction } from "../../importProcessing";
import { AmountCellRenderer } from "./AmountCellRenderer";
import styles from "./centerCellContents.module.css";
import { compareAmounts } from "./compareAmounts";
import {
  ComparisonCellRenderer,
  type AdditionalProps as ComparisonCellRendererProps,
} from "./ComparisonCellRenderer";
import {
  CustomHeader,
  type AdditionalProps as CustomHeaderProps,
} from "./CustomHeader";
import { StatusIconCellRenderer } from "./StatusIconCellRenderer";
import { theme } from "./theme";

export interface YNABProps {
  data: {
    transaction: YNABTransaction;
    isExcludedFromComparison: boolean;
    index: number;
  }[];
  toggleExcluded: (index: number) => void;
  hideExclusionColumn?: boolean;
  heightMode: "fitContent" | "fillContainer";
}

export type TData = YNABProps["data"][number];

export function YNABTable(props: YNABProps): React.JSX.Element {
  const {
    data,
    heightMode,
    toggleExcluded,
    hideExclusionColumn = false,
  } = props;

  const { defaultColDef, colDefs } = useMemo(
    () =>
      getColDefs({
        hideExclusionColumn,
        toggleExcluded,
      }),
    [hideExclusionColumn, toggleExcluded],
  );

  return (
    <AgGridReact
      theme={theme}
      getRowId={getRowId}
      rowData={data}
      defaultColDef={defaultColDef}
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

const getRowId: GetRowIdFunc<TData> = (params) => {
  return String(params.data.index);
};

const STATUS_ORDER = {
  uncleared: 0,
  cleared: 1,
  reconciled: 2,
} as const;

const compareClearedStatuses: ColDef<
  TData,
  TData["transaction"]["cleared"]
>["comparator"] = (a, b) => {
  if (a == null || b == null) return 0;
  else return STATUS_ORDER[a] - STATUS_ORDER[b];
};

function getColDefs({
  hideExclusionColumn,
  toggleExcluded,
}: {
  hideExclusionColumn: boolean;
  toggleExcluded: (index: number) => void;
}): {
  defaultColDef: ColDef<TData>;
  colDefs: ColDef<TData>[];
} {
  const defaultColDef: ColDef<TData, unknown> = {
    headerComponent: CustomHeader,
  };

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
    cellRenderer: ComparisonCellRenderer,
    cellRendererParams: {
      onClick: toggleExcluded,
      thisSide: "ynab",
    } satisfies ComparisonCellRendererProps,
    hide: hideExclusionColumn,
    cellClass: styles.centerCellContents,
  };

  const outflowColDef: ColDef<TData, currency> = {
    field: "transaction.outflow",
    headerName: "Outflow",
    type: "numericColumn",
    headerComponentParams: {
      rightAlign: true,
    } satisfies CustomHeaderProps,
    cellRenderer: AmountCellRenderer,
    comparator: compareAmounts,
  };

  const clearedColDef: ColDef<TData, YNABTransaction["cleared"]> = {
    field: "transaction.cleared",
    headerName: "Cleared",
    cellRenderer: StatusIconCellRenderer,
    comparator: compareClearedStatuses,
  };

  const colDefs: ColDef<TData>[] = [
    indexColDef,
    exclusionColDef,
    {
      field: "transaction.flag",
      headerName: "Flag",
    },
    {
      field: "transaction.date",
      headerName: "Date",
    },
    {
      field: "transaction.payee",
      headerName: "Payee",
    },
    {
      field: "transaction.categoryGroup",
      headerName: "Category group",
    },
    {
      field: "transaction.category",
      headerName: "Category",
    },
    {
      field: "transaction.memo",
      headerName: "Memo",
    },
    outflowColDef,
    clearedColDef,
  ];

  return { defaultColDef, colDefs };
}
