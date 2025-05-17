import { Amount } from "../../currencyFormatting";
import { BankColumnType, BankTransaction } from "../../importProcessing";

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
  onChangeColumnTypes?: (newColumnTypes: BankColumnType[]) => void;
  onExcludedChange?: (index: number, excluded: boolean) => void;
  hideExclusionColumn?: boolean;
  hideColumnTypeControls?: boolean;
}

export function BankTable(props: BankProps): React.JSX.Element {
  return (
    <table>
      <BankHead {...props} />
      <BankBody {...props} />
    </table>
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
              {props.hideColumnTypeControls || (
                <BankColumnTypeSelect
                  value={type}
                  onChange={(newType) => {
                    const newTypes = [
                      ...props.columnSpecs.map(({ type }) => type),
                    ];
                    newTypes[index] = newType;
                    props.onChangeColumnTypes?.(newTypes);
                  }}
                />
              )}
            </td>
          );
        })}
        {props.hideExclusionColumn || <td className="align-top">Exclude</td>}
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
            props.onExcludedChange?.(index, excluded)
          }
          hideExclusionColumn={props.hideExclusionColumn ?? false}
        />
      ))}
    </tbody>
  );
}

function BankRow({
  transaction,
  onExcludedChange,
  hideExclusionColumn,
}: {
  transaction: BankProps["transactions"][number];
  onExcludedChange: (excluded: boolean) => void;
  hideExclusionColumn: boolean;
}): React.JSX.Element {
  return (
    <tr className={transaction.isExcludedFromComparison ? "line-through" : ""}>
      {transaction.transaction.values.map((value, columnIndex) => {
        // TODO: Ideally we'd use bankColumnIsNumeric here, but TS has trouble with the type narrowing.
        return value.type === "inflow" || value.type === "outflow" ? (
          <td key={columnIndex} className="text-right align-top tabular-nums">
            <Amount amount={value.amount} />
          </td>
        ) : (
          <td key={columnIndex} className="align-top">
            {value.rawValue}
          </td>
        );
      })}

      {hideExclusionColumn || (
        <td className="align-top">
          <input
            type="checkbox"
            checked={transaction.isExcludedFromComparison}
            onChange={(e) => onExcludedChange(e.target.checked)}
          />
        </td>
      )}
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
