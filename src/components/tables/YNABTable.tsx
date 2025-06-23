import {
  type CellEditRequestEvent,
  type ColDef,
  type GetRowIdFunc,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo } from "react";

import { type YNABTransaction } from "../../importProcessing";
import { AmountCellRenderer } from "./AmountCellRenderer";
import {
  CustomHeader,
  type AdditionalProps as CustomHeaderProps,
} from "./CustomHeader";
import { StatusIconCellRenderer } from "./StatusIconCellRenderer";

export interface YNABProps {
  data: {
    transaction: YNABTransaction;
    isExcludedFromComparison: boolean;
    key: React.Key;
  }[];
  onExcludedChange: (key: React.Key, excluded: boolean) => void;
  hideExclusionColumn?: boolean;
  heightMode: "fitContent" | "fillContainer";
}

type TData = YNABProps["data"][number];

const defaultColDef: ColDef<TData, unknown> = {
  headerComponent: CustomHeader,
};

const dataColDefs: ColDef<TData, unknown>[] = [
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
  },
  {
    field: "transaction.cleared",
    headerName: "Cleared",
    cellRenderer: StatusIconCellRenderer,
  },
];

export function YNABTable(props: YNABProps): React.JSX.Element {
  const { data, heightMode, onExcludedChange, hideExclusionColumn } = props;

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
        onExcludedChange?.(data.key, newValue);
      }
    },
    [onExcludedChange],
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
  return String(params.data.key);
};
