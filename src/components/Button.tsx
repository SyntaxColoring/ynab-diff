import type React from "react";
import type { ComponentPropsWithoutRef } from "react";

interface CustomProps {
  variant?: "primary" | "cancel" | "secondary";
}

export type Props = ComponentPropsWithoutRef<"button"> & CustomProps;

/** A button with custom styling. */
export function Button(props: Props): React.JSX.Element {
  const { variant = "primary", ...restProps } = props;

  return (
    <button
      {...restProps}
      // TODO: Implement "secondary" variant.
      data-variant={variant === "secondary" ? "primary" : variant}
      className="rounded-xs border-2 bg-stone-50 px-2 py-0.5 transition-colors disabled:cursor-not-allowed data-[variant=cancel]:border-red-700 data-[variant=cancel]:text-red-700 data-[variant=cancel]:hover:bg-red-50 data-[variant=cancel]:active:bg-red-100 data-[variant=primary]:border-green-700 data-[variant=primary]:bg-green-700 data-[variant=primary]:text-stone-50 data-[variant=primary]:active:bg-green-800 data-[variant=primary]:disabled:border-stone-400 data-[variant=primary]:disabled:bg-stone-400"
    />
  );
}
