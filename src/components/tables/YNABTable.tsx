import {
  type CellEditRequestEvent,
  type ColDef,
  type GetRowIdFunc,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo } from "react";

import { type YNABTransaction } from "../../importProcessing";
import { AmountCellRenderer } from "./AmountCellRenderer";
import { compareAmounts } from "./compareAmounts";
import {
  CustomHeader,
  type AdditionalProps as CustomHeaderProps,
} from "./CustomHeader";
import { StatusIconCellRenderer } from "./StatusIconCellRenderer";

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

type TData = YNABProps["data"][number];

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

const defaultColDef: ColDef<TData, unknown> = {
  headerComponent: CustomHeader,
};

const dataColDefs: ColDef<TData>[] = [
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
  {
    field: "transaction.outflow",
    headerName: "Outflow",
    type: "numericColumn",
    headerComponentParams: {
      rightAlign: true,
    } satisfies CustomHeaderProps,
    cellRenderer: AmountCellRenderer,
    comparator: compareAmounts,
  },
  {
    field: "transaction.cleared",
    headerName: "Cleared",
    cellRenderer: StatusIconCellRenderer,
    comparator: compareClearedStatuses,
  },
];

export function YNABTable(props: YNABProps): React.JSX.Element {
  const { data, heightMode, toggleExcluded, hideExclusionColumn } = props;

  const colDefs: ColDef<TData, unknown>[] = useMemo(
    () => [
      {
        field: "isExcludedFromComparison",
        headerName: "Exclude",
        editable: true,
        hide: hideExclusionColumn,
      },
      ...dataColDefs,
    ],
    [hideExclusionColumn],
  );

  const handleCellEditRequest = React.useCallback(
    (params: CellEditRequestEvent<TData, boolean>) => {
      const { data, newValue } = params;
      if (newValue != null) {
        toggleExcluded?.(data.index);
      }
    },
    [toggleExcluded],
  );

  return (
    <AgGridReact
      getRowId={getRowId}
      rowData={data}
      defaultColDef={defaultColDef}
      columnDefs={colDefs}
      readOnlyEdit
      onCellEditRequest={handleCellEditRequest}
      domLayout={heightMode === "fitContent" ? "autoHeight" : "normal"}
    />
  );
}

const getRowId: GetRowIdFunc<TData> = (params) => {
  return String(params.data.index);
};
