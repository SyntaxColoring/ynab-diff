export interface Props {
  onChange: (value: string) => void;
  options: readonly (string | { value: string; label: string })[];
  required?: boolean;
  value: string;
}

export function Select({
  onChange,
  options,
  required,
  value,
}: Props): React.JSX.Element {
  return (
    <select
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
