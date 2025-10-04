import type { JSX, PropsWithChildren } from "react";

export function StepList({ children }: PropsWithChildren): JSX.Element {
  return (
    <ol className="grid grid-cols-[min-content_1fr] gap-x-4 gap-y-8">
      {children}
    </ol>
  );
}

StepList.Step = Step;

function Step({ number, children }: PropsWithChildren<{ number: string }>) {
  return (
    <li className="col-span-2 grid grid-cols-subgrid items-baseline">
      <div>
        <Circled>{number}</Circled>
      </div>
      <div>{children}</div>
    </li>
  );
}

Step.Heading = Heading;

function Heading({ text }: { text: string }): JSX.Element {
  return <p className="text-lg font-semibold">{text}</p>;
}

function Circled({ children }: PropsWithChildren): JSX.Element {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-well text-lg">
      {children}
    </span>
  );
}
