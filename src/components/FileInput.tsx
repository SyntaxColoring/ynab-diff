import type { ComponentProps } from "react";

export type Props = ComponentProps<"input">;

/** `<input type="file" ... />` with custom styling. */
export function FileInput(props: Props): React.JSX.Element {
  return (
    // TODO: Something weird is happening with Tailwind parsing here:
    // file:hover:bg-stone-400 is working even when the text part of the
    // element is hovered, even though it's only supposed to target the button part.
    <input
      type="file"
      className="cursor-pointer file:mr-2 file:cursor-pointer file:rounded-sm file:border-2 file:border-stone-700 file:bg-stone-200 file:px-4 file:py-0.5 file:hover:bg-stone-400"
      {...props}
    />
  );
}
