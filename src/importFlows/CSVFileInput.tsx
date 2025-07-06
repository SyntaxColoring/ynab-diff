import { useLayoutEffect, useMemo, useRef } from "react";



import { FileInput } from "../components/FileInput";


export interface Props {
  onChange: (newFile: File | null) => void;
  /** If provided, replace the name of the actual selected file (if there is one) with this string. */
  placeholderFilename: string | null;
}

export default function CSVFileInput(props: Props): React.JSX.Element {
  const { onChange, placeholderFilename } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // To populate the file input with an initial filename,
  // we need to do some gymnastics to feed it a dummy file.
  // https://stackoverflow.com/a/68182158/497934
  const fileList = useMemo(() => {
    if (placeholderFilename === null) return null;
    else {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File([], placeholderFilename));
      return dataTransfer.files;
    }
  }, [placeholderFilename]);

  useLayoutEffect(() => {
    if (fileInputRef.current !== null) {
      // If we have a placeholder filename, set it as the value of the file input.
      // This will not actually select a file, but will show the filename in the input.
      fileInputRef.current.files = fileList
      if (fileList !== null) {
        // TODO: Can this be set to null?
        // fileInputRef.current.files = fileList;
      } else {
        // If no placeholder, clear the input.
        //fileInputRef.current.value = "";
      }
    }
  })

  return (
    <FileInput
      ref={fileInputRef}
      accept="text/csv,.csv"
      onChange={(event) => {
        const file = event.target.files?.item(0);
        onChange(file ?? null);
      }}
    />
  );
}
