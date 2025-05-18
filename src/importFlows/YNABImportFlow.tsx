import { useState } from "react";
import { useAsync } from "react-async-hook";

import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { parseYNABCSV, YNABTransaction } from "../importProcessing";
import CSVFileInput from "./CSVFileInput";
import { useSelectYNABAccount } from "./useSelectYNABAccount";

export interface YNABImportFlowProps {
  showCancelButton: boolean;
  onSubmit(
    transactions: YNABTransaction[],
    account: string,
    filename: string,
  ): void;
  onCancel(): void;
}

export function YNABImportFlow({
  showCancelButton,
  onSubmit,
  onCancel,
}: YNABImportFlowProps): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const parseState = useAsync(parse, [file]);

  const { selection: selectedAccount, setSelection: setSelectedAccount } =
    useSelectYNABAccount(parseState.result?.accounts ?? []);

  return (
    <form className="flex flex-col space-y-8">
      <h1>Import CSV from YNAB</h1>

      <CSVFileInput onChange={setFile} />

      {parseState.loading && <p>Loading...</p>}

      {parseState.error && (
        <>
          <p>
            There was a problem importing that file: {parseState.error.message}
          </p>
          <p>Make sure this is a valid file exported from YNAB.</p>
        </>
      )}

      {parseState.result != null &&
        (parseState.result.accounts.length > 0 ? (
          <label>
            Account
            <Select
              options={[
                // TODO: More careful handling of accounts with the name "".
                { label: "Select account...", value: "" },
                ...parseState.result.accounts,
              ]}
              value={selectedAccount ?? ""}
              onChange={setSelectedAccount}
            />
          </label>
        ) : (
          <p>Error: This file is empty.</p>
        ))}

      <div className="flex justify-end gap-4">
        {showCancelButton && (
          <Button variant="cancel" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          disabled={!(parseState.result != null && selectedAccount !== null)}
          disabledReason={
            parseState.result == null
              ? "To continue, select a file"
              : "To continue, select an account"
          }
          onClick={() => {
            if (parseState.result != null && selectedAccount !== null) {
              onSubmit(
                parseState.result.transactions,
                selectedAccount,
                parseState.result.filename,
              );
            }
          }}
        >
          Import
        </Button>
      </div>
    </form>
  );
}

async function parse(file: File | null): Promise<{
  transactions: YNABTransaction[];
  accounts: string[];
  filename: string;
} | null> {
  if (file === null) return null;
  const transactions = parseYNABCSV(await file.text());
  const accounts = getMentionedYNABAccounts(transactions);
  const filename = file.name;
  return { transactions, accounts, filename };
}

function getMentionedYNABAccounts(transactions: YNABTransaction[]): string[] {
  const uniqueAccounts = new Set(transactions.map((t) => t.account));
  return [...uniqueAccounts].sort(Intl.Collator().compare);
}
