import type { Column, SortDirection } from "ag-grid-community";
import { CustomHeaderProps } from "ag-grid-react";
import { useCallback, useSyncExternalStore } from "react";

import { Select, Props as SelectProps } from "../Select";

export interface AdditionalProps {
  rightAlign?: boolean;
  menuOptions?: SelectProps["options"];
  selectedMenuOption?: SelectProps["value"];
  onSelectMenuOption?(newSelectedMenuOption: string): void;
}

export type Props = CustomHeaderProps & AdditionalProps;

/**
 * A custom ag-grid header component.
 *
 * Adds a dropdown below the header text for selecting the column type.
 *
 * No ag-grid column menu (it's an ag-grid enterprise feature so we don't use it)
 * and no filter button (we just happen to not need it so far).
 */
export function CustomHeader(props: Props): JSX.Element {
  const {
    column,
    displayName,
    enableSorting,
    menuOptions,
    onSelectMenuOption,
    progressSort,
    rightAlign,
    selectedMenuOption,
  } = props;

  // The ag-grid docs say we get rerendered if the column definition changes.
  // The sort direction is part of "column state," not the column definition, so it's
  // unclear if we're guaranteed to get rererendered if that changes. Subscribe to it
  // just in case.
  const sortDirection = useSortDirection(column);

  const handleClick = useCallback(() => {
    if (enableSorting) {
      progressSort(
        // Disable multisort. The default is enabled, which feels like confusing UX.
        false,
      );
    }
  }, [enableSorting, progressSort]);

  return (
    <div className="w-full space-y-1">
      <NameAndSortIcon
        displayName={displayName}
        onClick={handleClick}
        rightAlign={rightAlign}
        sortDirection={sortDirection}
      />
      {menuOptions && (
        <Select
          className={"w-full " + (rightAlign ? "text-right" : "")}
          options={menuOptions}
          value={selectedMenuOption}
          onChange={onSelectMenuOption}
        />
      )}
    </div>
  );
}

function NameAndSortIcon(props: {
  displayName: string;
  onClick?(): void;
  rightAlign?: boolean;
  sortDirection: SortDirection;
}): JSX.Element {
  const { displayName, onClick, rightAlign, sortDirection } = props;
  const direction = rightAlign ? "flex-row-reverse" : "flex-row";
  return (
    <div
      className={`${direction} flex w-full cursor-pointer gap-1`}
      onClick={onClick}
    >
      <span className="flex-initial overflow-hidden overflow-ellipsis">
        {displayName}
      </span>
      {sortDirection && (
        <span className="flex-none">
          <SortIcon sortDirection={sortDirection} />
        </span>
      )}
    </div>
  );
}

function SortIcon(props: {
  sortDirection: NonNullable<SortDirection>;
}): JSX.Element {
  switch (props.sortDirection) {
    case "asc":
      return <>↓</>;
    case "desc":
      return <>↑</>;
  }
}

/** Return a column's current sort direction. */
function useSortDirection(column: Column): SortDirection {
  const subscribe = useCallback(
    (handleSortChanged: () => void) => {
      column.addEventListener("sortChanged", handleSortChanged);
      const unsubscribe = () => {
        column.removeEventListener("sortChanged", handleSortChanged);
      };
      return unsubscribe;
    },
    [column],
  );
  const getSnapshot = useCallback(() => column.getSort(), [column]);

  const sortDirection = useSyncExternalStore(subscribe, getSnapshot) ?? null;
  return sortDirection;
}
