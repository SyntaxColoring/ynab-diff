import type React from "react";
import { useLayoutEffect, useRef, type PropsWithChildren } from "react";

interface Props {
  /**
   * Called when the modal has been closed through built-in means, like the user hitting Esc.
   *
   * Strangely, the dialog closing through these means is outside of our control. We can't intercept
   * the event and prevent it from happening. https://issues.chromium.org/issues/41491338.
   * (Hence, past-tense "onClosed" instead of the more conventional "onClose".)
   *
   * Therefore, this handler MUST always immediately update our state to reflect that the dialog
   * has been closed, otherwise our state will fall out of sync with the browser's reality.
   */
  onClosed: () => void;
}

/**
 * A styled modal dialog container.
 *
 * Always open. To "close" it, remove it from the DOM.
 */
export function Modal({
  onClosed,
  children,
}: PropsWithChildren<Props>): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    dialogRef.current?.showModal();
  });

  return (
    <dialog
      ref={dialogRef}
      onClose={onClosed}
      // Allow clicking on the backdrop outside the dialog to close it.
      // @ts-expect-error New attribute, not recognized by TS yet.
      // eslint-disable-next-line react/no-unknown-property
      closedby="any"
      className="m-min w-full max-w-lg rounded-md border-2 border-stone-950 bg-stone-50 p-2 shadow backdrop:bg-stone-500 backdrop:opacity-80"
    >
      {children}
    </dialog>
  );
}
