import type { JSX, PropsWithChildren } from "react";

/** <details> with custom styling. */
export function Details({ children }: PropsWithChildren): JSX.Element {
  return (
    <details className="rounded-md px-2 py-0.5 open:bg-well">
      {children}
    </details>
  );
}

Details.Summary = Summary;

function Summary({ children }: PropsWithChildren): JSX.Element {
  return (
    <summary className="group cursor-pointer">
      <span className="italic decoration-dotted underline-offset-2 group-hover:underline">
        {children}
      </span>
    </summary>
  );
}
