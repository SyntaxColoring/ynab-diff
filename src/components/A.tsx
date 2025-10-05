import type { ComponentProps } from "react";

/** `<a>` with custom styling. */
export function A(props: Omit<ComponentProps<"a">, "className">): JSX.Element {
  return (
    <a className="text-green-700 underline hover:text-green-800" {...props} />
  );
}
