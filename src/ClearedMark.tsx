export function ClearedMark({
  status,
}: {
  status: "cleared" | "uncleared" | "reconciled";
}): React.JSX.Element {
  // TODO: ARIA stuff and style as a circle.
  if (status === "cleared") {
    return (
      <span title="Cleared" className="font-bold bg-green-700 text-white">
        C
      </span>
    );
  } else if (status === "uncleared") {
    return (
      <span title="Uncleared" className="font-bold border border-black">
        C
      </span>
    );
  } else {
    status satisfies "reconciled";
    return <span title="Reconciled">🔒</span>;
  }
}
