import { StatusIcon } from "../StatusIcon";
import { Amount } from "../../currencyFormatting";
import { YNABTransaction } from "../../importProcessing";

export interface YNABProps {
  data: {
    transaction: YNABTransaction;
    isExcludedFromComparison: boolean;
    key: React.Key;
  }[];
  onExcludedChange: (index: number, excluded: boolean) => void;
}

export function YNABTable(props: YNABProps): React.JSX.Element {
  return (
    <table>
      <YNABHead />
      <YNABBody {...props} />
    </table>
  );
}

function YNABHead(): React.JSX.Element {
  return (
    <thead>
      <tr>
        <td className="align-top">Flag</td>
        <td className="text-right align-top tabular-nums">Date</td>
        <td className="align-top">Payee</td>
        <td className="align-top">Category group</td>
        <td className="align-top">Category</td>
        <td className="align-top">Memo</td>
        <td className="text-right align-top tabular-nums">Outflow</td>
        <td className="align-top">Cleared</td>
        <td className="align-top">Exclude</td>
      </tr>
    </thead>
  );
}

function YNABBody(props: YNABProps): React.JSX.Element {
  return (
    <tbody>
      {props.data.map((transaction, index) => (
        <YNABRow
          key={transaction.key}
          transaction={transaction}
          onExcludedChange={(excluded) =>
            props.onExcludedChange(index, excluded)
          }
        />
      ))}
    </tbody>
  );
}

function YNABRow({
  transaction,
  onExcludedChange,
}: {
  transaction: YNABProps["data"][number];
  onExcludedChange: (excluded: boolean) => void;
}): React.JSX.Element {
  return (
    <tr className={transaction.isExcludedFromComparison ? "line-through" : ""}>
      <td className="align-top">{transaction.transaction.flag}</td>
      <td className="text-right align-top tabular-nums">
        {transaction.transaction.date}
      </td>
      <td className="align-top">{transaction.transaction.payee}</td>
      <td className="align-top">{transaction.transaction.categoryGroup}</td>
      <td className="align-top">{transaction.transaction.category}</td>
      <td className="align-top">{transaction.transaction.memo}</td>
      <td className="text-right align-top tabular-nums">
        <Amount amount={transaction.transaction.outflow} />
      </td>
      <td className="align-top">
        <StatusIcon status={transaction.transaction.cleared} />
      </td>
      <td className="align-top">
        <input
          type="checkbox"
          checked={transaction.isExcludedFromComparison}
          onChange={(e) => onExcludedChange(e.target.checked)}
        />
      </td>
    </tr>
  );
}
