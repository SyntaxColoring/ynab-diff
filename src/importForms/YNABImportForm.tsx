import { useState } from "react";
import { useAsync } from "react-async-hook";

import { Details } from "../components/Details";
import { ErrorBlock } from "../components/ErrorBlock";
import { Button } from "../components/inputs/Button";
import { Select } from "../components/inputs/Select";
import { parseYNABCSV, type YNABTransaction } from "../importProcessing";
import CSVFileInput from "./CSVFileInput";
import { StepList } from "./StepList";
import { useSelectYNABAccount } from "./useSelectYNABAccount";

export interface YNABImportFormProps {
  showCancelButton: boolean;
  onSubmit: (
    transactions: YNABTransaction[],
    account: string,
    filename: string,
  ) => void;
  onCancel: () => void;
}

export function YNABImportForm({
  showCancelButton,
  onSubmit,
  onCancel,
}: YNABImportFormProps): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const parseState = useAsync(parse, [file]);

  const { selection: selectedAccount, setSelection: setSelectedAccount } =
    useSelectYNABAccount(parseState.result?.accounts ?? []);

  return (
    <form className="space-y-8">
      <h1>YNAB</h1>

      <StepList>
        <StepList.Step number="1">
          <div className="space-y-2">
            <StepList.Step.Heading text="Export transactions from YNAB" />
            <Details>
              <Details.Summary>Instructions</Details.Summary>
              <div className="mt-2 space-y-2">
                <p>In the YNAB web app:</p>
                <ol className="ml-8 list-decimal space-y-2">
                  <li>Sort transactions by date.</li>
                  <li>
                    Select every transaction from today going back to the last
                    time you reconciled. It's okay to include scheduled and
                    uncleared transactions.
                  </li>
                  <li>
                    From the action bar at the bottom, select{" "}
                    <b>
                      More &gt; Export <i>n</i> transactions
                    </b>
                    . This will export a CSV file.
                  </li>
                </ol>
              </div>
            </Details>
          </div>
        </StepList.Step>
        <StepList.Step number="2">
          <div className="space-y-2">
            <StepList.Step.Heading text="Import them here" />
            <CSVFileInput onChange={setFile} />
            {(() => {
              if (parseState.loading) {
                return <p>Loading...</p>;
              } else if (parseState.error) {
                return (
                  <ErrorBlock summary="That file couldn't be imported.">
                    <div className="mt-2 space-y-2">
                      <p>Make sure it's a valid CSV file exported from YNAB.</p>
                      <p>
                        <i>Details: {parseState.error.message}</i>
                      </p>
                    </div>
                  </ErrorBlock>
                );
              } else if (
                parseState.result != null &&
                parseState.result.accounts.length == 0
              ) {
                return <ErrorBlock summary="That file is empty." />;
              } else {
                return (
                  <p>
                    Your financial info is kept private and will not leave your
                    computer.
                  </p>
                );
              }
            })()}
          </div>
        </StepList.Step>
        <StepList.Step number="3">
          <div className="space-y-2">
            <StepList.Step.Heading text="Select an account" />
            <Select
              disabled={parseState.result == null}
              options={[
                // TODO: More careful handling of accounts with the name "".
                { label: "Select account...", value: "" },
                ...(parseState.result?.accounts ?? []),
              ]}
              value={selectedAccount ?? ""}
              onChange={setSelectedAccount}
            />
          </div>
        </StepList.Step>
      </StepList>

      <div className="flex justify-end gap-4">
        {showCancelButton && <Button onClick={onCancel}>Cancel</Button>}
        <Button
          variant="primary"
          disabled={!(parseState.result != null && selectedAccount !== null)}
          title={
            parseState.result == null
              ? "To continue, select a file"
              : selectedAccount == null
                ? "To continue, select an account"
                : undefined
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
  const collator = Intl.Collator();
  return [...uniqueAccounts].sort(collator.compare.bind(collator));
}
