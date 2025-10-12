import { X } from "lucide-react";
import {
  useImperativeHandle,
  useRef,
  type JSX,
  type ReactNode,
  type Ref,
} from "react";

interface Props {
  title: string;
  ref?: Ref<DialogHandle>;
  children?: ReactNode;
}

export interface DialogHandle {
  show: () => void;
}

/**
 * A modal dialog that can be opened imperatively.
 *
 * (Chrome has weirdness that makes it sketchy to treat modals as controlled,
 * so we don't attempt that. https://issues.chromium.org/issues/41491338)
 *
 * Can be closed by clicking a built-in "X" button, by clicking on the backdrop, or
 * by a platform-specific action like hitting Esc.
 */
export function Dialog(props: Props): JSX.Element {
  const { title, ref, children } = props;

  const underlyingDialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => {
    return {
      show: () => underlyingDialogRef.current?.showModal(),
    };
  });

  return (
    <dialog
      ref={underlyingDialogRef}
      className="mx-auto mt-4 w-lg max-w-[100%] rounded-md bg-section-bg p-3 backdrop:bg-stone-950/50 backdrop:backdrop-blur"
      // Relatively new property, seems like React and/or eslint-plugin-react don't have it yet.
      // eslint-disable-next-line react/no-unknown-property
      closedby="any"
    >
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <button
          type="button"
          aria-label="Close"
          onClick={() => underlyingDialogRef.current?.close()}
          className="cursor-pointer text-stone-500 hover:text-base-text"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
