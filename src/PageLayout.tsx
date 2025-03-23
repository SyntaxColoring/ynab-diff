import React from "react";

export interface PageLayoutProps {
  headerArea: React.JSX.Element;
  ynabImportArea: React.JSX.Element;
  bankImportArea: React.JSX.Element;
  filterArea: React.JSX.Element | null;
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
    <div className="grid grid-cols-2">
      <div className="col-span-2">{headerArea}</div>

      <div>{ynabImportArea}</div>
      <div>{bankImportArea}</div>

      {filterArea && <div className="col-span-2">{filterArea}</div>}

      <div>{ynabArea}</div>
      <div>{bankArea}</div>
    </div>
  );
}
