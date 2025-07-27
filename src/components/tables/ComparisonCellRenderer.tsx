import { type CustomCellRendererProps } from "ag-grid-react";
import { useCallback, useEffect, useRef, type ComponentProps } from "react";

import { ComparedIcon } from "../icons/ComparedIcon";
import type { TData as BankTData } from "./BankTable";
import type { TData as YNABTData } from "./YNABTable";

export interface AdditionalProps {
  thisSide: ComponentProps<typeof ComparedIcon>["thisSide"];
  onClick?: (index: number) => void;
}

type Props = CustomCellRendererProps<YNABTData | BankTData, boolean> &
  AdditionalProps;

/**
 * A custom ag-grid cell renderer for "included in comparison" / "not included in comparison"
 * toggle button icons.
 */
export function ComparisonCellRenderer(props: Props): JSX.Element {
  const {
    value: isExcludedFromComparison,
    thisSide,
    onClick,
    eGridCell,
  } = props;

  const handleClick = useCallback(() => {
    if (props.data != null) onClick?.(props.data.index);
  }, [onClick, props.data]);

  const controlRef = useRef<HTMLButtonElement>(null);

  // A hack to try to improve keyboard navigation and accessibility to screen readers.
  //
  // As https://www.w3.org/WAI/ARIA/apg/patterns/grid/#gridNav_focus says, ideally, navigating to
  // this cell with the keyboard would directly focus the control inside it. ag-grid does not
  // let that happen by default; its keyboard navigation only focuses the cells themselves.
  //
  // This works around it by moving focus to the control any time the cell is focused.
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      if (event.target === eGridCell) {
        controlRef.current?.focus();
      }
    };

    eGridCell.addEventListener("focus", handleFocus);
    return () => {
      eGridCell.removeEventListener("focus", handleFocus);
    };
  }, [eGridCell, handleClick]);

  return (
    <button
      ref={controlRef}
      aria-pressed={!isExcludedFromComparison}
      onClick={handleClick}
      // With ag-grid taking charge of keyboard navigation, it's probably not possible for
      // this element to ever be tabbed to "naturally" via the browser's default behavior.
      // Just for predictability, let's formalize that by passing -1 to opt out of the
      // browser default tabbing.
      tabIndex={-1}
    >
      <ComparedIcon thisSide={thisSide} compared={!isExcludedFromComparison} />
    </button>
  );
}
