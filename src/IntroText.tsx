import type { JSX } from "react";

import { A } from "./components/A";

export function IntroText(): JSX.Element {
  return (
    <div className="flex flex-row justify-center-safe">
      <div className="max-w-2xl space-y-2">
        <p>
          This is a tool for <A href="https://ynab.com">YNAB</A> users.
        </p>
        <p>
          It finds differences between the transactions that you've recorded in
          YNAB and the actual ones in your underlying bank or credit card. If
          you're trying to reconcile your accounts and can't figure out why
          things aren't adding up, this can help narrow down the problem.
        </p>
        <p>To begin, import your transactions.</p>
      </div>
    </div>
  );
}
