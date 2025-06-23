import type React from "react";

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
    <div className="grid h-dvh grid-cols-2 grid-rows-[min-content_min-content_1fr] gap-2 p-2">
      <div className="col-span-2">
        <Card>{headerArea}</Card>
      </div>

      <div className="col-span-2">
        <Card>{filterArea}</Card>
      </div>

      <Card>{ynabArea}</Card>
      <Card>{bankArea}</Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="overflow-auto rounded-md bg-stone-200 p-2">{children}</div>
  );
}
