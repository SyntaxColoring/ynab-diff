import { TriangleAlert } from "lucide-react";
import type { JSX, PropsWithChildren } from "react";

interface Props {
  summary: string;
}

export function ErrorBlock(props: PropsWithChildren<Props>): JSX.Element {
  const { summary, children } = props;
  return (
    <div className="rounded-md border border-red-800 bg-red-100 px-2 py-0.5">
      <p className="font-bold">
        <TriangleAlert className="inline-block h-[0.8lh]" /> {summary}
      </p>
      {children}
    </div>
  );
}
