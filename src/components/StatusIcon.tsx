/**
 * A recreation of the YNAB cleared/uncleared/reconciled status icons.
 *
 * Sizes automatically to follow the font height.
 */
export function StatusIcon({
  status,
}: {
  status: "cleared" | "uncleared" | "reconciled";
}): React.JSX.Element {
  switch (status) {
    case "cleared":
      return <Cleared />;
    case "uncleared":
      return <Uncleared />;
    case "reconciled":
      return <Reconciled />;
  }
}

const C_RADIUS = 0.4;
const C_ANGLE = (45 / 360) * (2 * Math.PI);
const C_X = C_RADIUS * Math.cos(C_ANGLE);
const C_Y = C_RADIUS * Math.sin(C_ANGLE);
const C_PATH = `M ${C_X} ${C_Y} A ${C_RADIUS} ${C_RADIUS} 0 1 1 ${C_X} ${-C_Y}`;

function Cleared(): React.JSX.Element {
  return (
    <svg
      className="inline h-[1cap] align-baseline"
      role="graphics-symbol"
      viewBox="-1 -1 2 2"
    >
      <title>Cleared</title>
      <circle className="fill-green-700" cx="0" cy="0" r="1" />
      <path
        className="stroke-white"
        strokeWidth="0.2"
        strokeLinecap="round"
        fill="none"
        d={C_PATH}
      />
    </svg>
  );
}

function Uncleared(): React.JSX.Element {
  return (
    <svg
      className="inline h-[1cap] align-baseline"
      role="graphics-symbol"
      viewBox="-1 -1 2 2"
    >
      <title>Uncleared</title>
      <circle
        className="stroke-gray-600"
        strokeWidth="0.2"
        fill="none"
        cx="0"
        cy="0"
        r="0.9"
      />
      <path
        className="stroke-gray-600"
        strokeWidth="0.2"
        strokeLinecap="round"
        fill="none"
        d={C_PATH}
      />
    </svg>
  );
}

function Reconciled(): React.JSX.Element {
  return (
    <svg
      className="inline h-[1cap] align-baseline"
      role="graphics-symbol"
      viewBox="-0.8 -1 1.6 2"
    >
      <title>Reconciled</title>
      <rect
        className="fill-green-700"
        x="-0.8"
        y="-0.2"
        width="1.6"
        height="1.2"
        rx="0.2"
      />
      <path
        className="stroke-green-700"
        strokeWidth="0.2"
        fill="none"
        d="M 0.5 -0.2
        l 0 -0.2
        a 0.5 0.5 0 1 0 -1 0
        l 0 0.2"
      />
    </svg>
  );
}
