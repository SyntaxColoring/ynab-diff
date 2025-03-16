import { StatusIcon } from "./StatusIcon";
import { Amount } from "./currencyFormatting";
import {
  BankColumnType,
  BankTransaction,
  YNABTransaction,
} from "./importProcessing";

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

export interface BankProps {
  transactions: {
    transaction: BankTransaction;
    key: React.Key;
    isExcludedFromComparison: boolean;
  }[];
  columnSpecs: {
    name: string;
    type: BankColumnType;
  }[];
  onChangeColumnTypes: (newColumnTypes: BankColumnType[]) => void;
  onExcludedChange: (index: number, excluded: boolean) => void;
}

export function BankTable(props: BankProps): React.JSX.Element {
  return (
    <table>
      <BankHead {...props} />
      <BankBody {...props} />
    </table>
  );
}

function YNABHead(): React.JSX.Element {
  return (
    <thead>
      <tr>
        <td className="align-top">Flag</td>
        <td className="align-top text-right tabular-nums">Date</td>
        <td className="align-top">Payee</td>
        <td className="align-top">Category group</td>
        <td className="align-top">Category</td>
        <td className="align-top">Memo</td>
        <td className="align-top text-right tabular-nums">Outflow</td>
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
      <td className="align-top text-right tabular-nums">
        {transaction.transaction.date}
      </td>
      <td className="align-top">{transaction.transaction.payee}</td>
      <td className="align-top">{transaction.transaction.categoryGroup}</td>
      <td className="align-top">{transaction.transaction.category}</td>
      <td className="align-top">{transaction.transaction.memo}</td>
      <td className="align-top text-right tabular-nums">
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

function BankHead(props: BankProps): React.JSX.Element {
  return (
    <thead>
      <tr>
        {props.columnSpecs.map(({ name, type }, index) => {
          return (
            <td
              key={index}
              className={
                "align-top " +
                (bankColumnIsNumeric(type) ? "text-right tabular-nums" : "")
              }
            >
              {name}
              <BankColumnTypeSelect
                value={type}
                onChange={(newType) => {
                  const newTypes = [
                    ...props.columnSpecs.map(({ type }) => type),
                  ];
                  newTypes[index] = newType;
                  props.onChangeColumnTypes(newTypes);
                }}
              />
            </td>
          );
        })}
        <td className="align-top">Exclude</td>
      </tr>
    </thead>
  );
}

function BankBody(props: BankProps): React.JSX.Element {
  return (
    <tbody>
      {props.transactions.map((transaction, index) => (
        <BankRow
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

function BankRow({
  transaction,
  onExcludedChange,
}: {
  transaction: BankProps["transactions"][number];
  onExcludedChange: (excluded: boolean) => void;
}): React.JSX.Element {
  return (
    <tr className={transaction.isExcludedFromComparison ? "line-through" : ""}>
      {transaction.transaction.values.map((value, columnIndex) => {
        // TODO: Ideally we'd use bankColumnIsNumeric here, but TS has trouble with the type narrowing.
        return value.type === "inflow" || value.type === "outflow" ? (
          <td key={columnIndex} className="align-top text-right tabular-nums">
            <Amount amount={value.amount} />
          </td>
        ) : (
          <td key={columnIndex} className="align-top">
            {value.rawValue}
          </td>
        );
      })}
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

// TODO: Use our own Select component for this, probably
function BankColumnTypeSelect({
  value,
  onChange,
}: {
  value: BankColumnType;
  onChange: (value: BankColumnType) => void;
}): React.JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BankColumnType)}
    >
      <option value={"other" satisfies BankColumnType}>Other</option>
      <option value={"inflow" satisfies BankColumnType}>Inflow</option>
      <option value={"outflow" satisfies BankColumnType}>Outflow</option>
    </select>
  );
}

function bankColumnIsNumeric(
  columnType: BankColumnType,
): columnType is "inflow" | "outflow" {
  return columnType === "inflow" || columnType === "outflow";
}
