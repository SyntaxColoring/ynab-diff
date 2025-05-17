import React from "react";

export interface PageLayoutProps {
  headerArea: React.JSX.Element;
  filterArea: React.JSX.Element;
  ynabArea: React.JSX.Element;
  bankArea: React.JSX.Element;
}

export function PageLayout({
  headerArea,
  filterArea,
  ynabArea,
  bankArea,
}: PageLayoutProps) {
  return (
    <div className="grid h-dvh grid-cols-2 grid-rows-[min-content_min-content_min-content_1fr] gap-[--gap] [--gap:theme(spacing.2)]">
      <div className="col-span-2 bg-stone-200">{headerArea}</div>

      <div className="col-span-2 bg-stone-200">{filterArea}</div>

      <div className="pl-[--gap]">
        <Card>{ynabArea}</Card>
      </div>
      <div className="pr-[--gap]">
        <Card>{bankArea}</Card>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="overflow-auto rounded-md bg-stone-200 p-2">{children}</div>
  );
}
