import type React from "react";

export type Props = React.PropsWithChildren<{
  variant?: "primary" | "cancel" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}>;

/** A button with custom styling. */
export function Button(props: Props): React.JSX.Element {
  const { onClick, disabled, disabledReason, children } = props;

  // TODO
  let { variant = "primary" } = props;
  if (variant === "secondary") variant = "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      data-variant={variant}
      className="rounded-sm border-2 bg-stone-50 px-4 py-0.5 transition-colors disabled:cursor-not-allowed data-[variant=cancel]:border-red-700 data-[variant=primary]:border-green-700 data-[variant=primary]:bg-green-700 data-[variant=cancel]:text-red-700 data-[variant=primary]:text-stone-50 data-[variant=cancel]:hover:bg-red-50 data-[variant=cancel]:active:bg-red-100 data-[variant=primary]:active:bg-green-800 data-[variant=primary]:disabled:border-stone-400 data-[variant=primary]:disabled:bg-stone-400"
    >
      {children}
    </button>
  );
}
