import {
  type CellEditRequestEvent,
  type ColDef,
  type GetRowIdFunc,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo } from "react";

import {
  type BankColumnType,
  type BankTransaction,
  type BankValue,
} from "../../importProcessing";
import { BankValueCellRenderer } from "./AmountCellRenderer";
import {
  CustomHeader,
  type AdditionalProps as CustomHeaderProps,
} from "./CustomHeader";

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

type TData = Props["transactions"][number];

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

  const colDefs = useMemo(() => {
    const exclusionColDef: ColDef<TData, boolean> = {
      field: "isExcludedFromComparison",
      headerName: "Exclude",
      editable: true,
      hide: hideExclusionColumn,
      headerComponent: CustomHeader,
      headerComponentParams: {} satisfies CustomHeaderProps,
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

    return [exclusionColDef, ...dataColDefs];
  }, [
    columnSpecs,
    hideColumnTypeControls,
    hideExclusionColumn,
    onChangeColumnTypes,
  ]);

  const handleCellEditRequest = useCallback(
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
      rowData={transactions}
      columnDefs={colDefs}
      readOnlyEdit
      onCellEditRequest={handleCellEditRequest}
      domLayout={heightMode === "fitContent" ? "autoHeight" : "normal"}
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
    return a.amount.intValue - b.amount.intValue;
  } else {
    return a.rawValue.localeCompare(b.rawValue);
  }
}
