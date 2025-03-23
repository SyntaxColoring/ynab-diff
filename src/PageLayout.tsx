import React from "react";

export interface PageLayoutProps {
  headerArea: React.JSX.Element;
  ynabImportArea: React.JSX.Element;
  bankImportArea: React.JSX.Element;
  filterArea: React.JSX.Element;
  ynabArea: React.JSX.Element;
  bankArea: React.JSX.Element;
}

export function PageLayout({
  headerArea,
  ynabImportArea,
  bankImportArea,
  filterArea,
  ynabArea,
  bankArea,
}: PageLayoutProps) {
  return (
    <div
      className="
      h-dvh
      grid
      grid-cols-2
      grid-rows-[min-content_min-content_min-content_1fr]
    "
    >
      <div className="col-span-2">{headerArea}</div>

      <div>{ynabImportArea}</div>
      <div>{bankImportArea}</div>

      <div className="col-span-2">{filterArea}</div>

      <div className="overflow-auto">{ynabArea}</div>
      <div className="overflow-auto">{bankArea}</div>
    </div>
  );
}
