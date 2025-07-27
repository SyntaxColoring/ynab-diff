import { type CustomCellRendererProps } from "ag-grid-react";

import { type YNABTransaction } from "../../importProcessing";
import { StatusIcon } from "../icons/StatusIcon";

export function StatusIconCellRenderer(
  props: CustomCellRendererProps<unknown, YNABTransaction["cleared"], unknown>,
): JSX.Element | null {
  const { value } = props;
  if (value == null) {
    return null;
  } else {
    return <StatusIcon status={value} />;
  }
}
