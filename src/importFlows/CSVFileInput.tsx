import { FileInput } from "../components/FileInput";

export default function CSVFileInput({
  onChange,
}: {
  onChange: (newFile: File | null) => void;
}): React.JSX.Element {
  return (
    <FileInput
      accept="text/csv,.csv"
      onChange={(event) => {
        const file = event.target.files?.item(0);
        onChange(file ?? null);
      }}
    />
  );
}
