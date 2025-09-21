import { SearchCheck, SearchSlash } from "lucide-react";
import type { ComponentProps, JSX } from "react";

interface Props
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  extends ComponentProps<typeof SearchCheck & typeof SearchSlash> {
  compared: boolean;
  thisSide: "bank" | "ynab";
}

/**
 * An "included in comparison" / "not included in comparison" icon.
 */
export function ComparedIcon(props: Props): JSX.Element {
  const { compared, thisSide, ...rest } = props;
  const className = compared ? "text-green-700" : "text-gray-400";

  const thisSideCopy = thisSide === "bank" ? "bank" : "YNAB";
  const otherSideCopy = thisSide === "bank" ? "YNAB" : "bank";

  const title = compared
    ? `This ${thisSideCopy} transaction is included in the comparison, meaning you expect it to have a match on the ${otherSideCopy} side.`
    : `This ${thisSideCopy} transaction is excluded from the comparison, meaning you don't expect it to have a match on the ${otherSideCopy} side.`;
  return compared ? (
    <SearchCheck {...{ className, ...rest }}>
      <title>{title}</title>
    </SearchCheck>
  ) : (
    <SearchSlash {...{ className, ...rest }}>
      <title>{title}</title>
    </SearchSlash>
  );
}
