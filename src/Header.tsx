import { ExternalLink, Redo2, Undo2 } from "lucide-react";
import { useCallback, useRef, type Ref } from "react";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";



import { A } from "./components/A";
import { Dialog, type DialogHandle } from "./components/Dialog";
import { Button } from "./components/inputs/Button";
import { Select } from "./components/inputs/Select";
import { ObfuscatedEmail } from "./components/ObfuscatedEmail";
import { CURRENCY_CODES } from "./currencyFormatting";
import { setCurrencyFormat } from "./redux/currencyFormatSlice";
import { useAppDispatch, useAppSelector } from "./redux/typedHooks";
import { useUndoRedoShortcuts } from "./useUndoRedoShortcuts";


export function Header(): React.JSX.Element {
  const dialogRef = useRef<DialogHandle>(null);
  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">YNAB Diff</h1>
          <Button
            type="button"
            onClick={() => {
              dialogRef.current?.show();
            }}
          >
            Contact
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <UndoRedoButtons />
          <CurrencySelector />
        </div>
      </header>
      <ContactDialog ref={dialogRef} />
    </>
  );
}

function UndoRedoButtons(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const handleUndo = useCallback(() => {
    dispatch(ReduxUndoActionCreators.undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(ReduxUndoActionCreators.redo());
  }, [dispatch]);

  const canUndo = useAppSelector((state) => state.past.length > 0);
  const canRedo = useAppSelector((state) => state.future.length > 0);

  const shortcuts = useUndoRedoShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        variant="secondary"
        onClick={handleUndo}
        disabled={!canUndo}
        title={`Undo (${shortcuts.undo.instructions.text})`}
        // TODO: aria-keyshortcuts is read redundantly with title. Does it make sense to use both?
        aria-keyshortcuts={shortcuts.undo.instructions.aria}
      >
        <span className="flex items-center gap-1">
          <Undo2 height="20px" />
          <span>Undo</span>
        </span>
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={handleRedo}
        disabled={!canRedo}
        title={`Redo (${shortcuts.redo.instructions.text})`}
        // TODO: aria-keyshortcuts is read redundantly with title. Does it make sense to use both?
        aria-keyshortcuts={shortcuts.redo.instructions.aria}
      >
        <span className="flex items-center gap-1">
          <Redo2 height="20px" />
          <span>Redo</span>
        </span>
      </Button>
    </div>
  );
}

function CurrencySelector(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const currencyCode = useAppSelector((state) => state.present.currencyFormat);

  return (
    <label className="flex items-center gap-2">
      <span>Currency format</span>
      <Select
        options={CURRENCY_CODES}
        value={currencyCode}
        onChange={(value) => dispatch(setCurrencyFormat(value))}
      />
    </label>
  );
}

function ContactDialog(props: { ref: Ref<DialogHandle> }) {
  const { ref } = props;
  return (
    <Dialog ref={ref} title="Contact">
      <div className="mt-2 space-y-2">
        <p>Created by Max Marrone.</p>
        <p>
          Feel free to email me directly:{" "}
          <ObfuscatedEmail base64Email="bWF4QG1hcnJvbmUubnlj" target="_blank" />
        </p>
        <p>
          <A href="https://github.com/SyntaxColoring/ynab-diff" target="_blank">
            View source code on GitHub{" "}
            <ExternalLink
              width="12"
              height="12"
              viewBox="2 2 20 20"
              className="inline align-baseline"
            />
          </A>
        </p>
        <p>Blah</p>
        <p>Blah</p>
        <p>Blah</p>
        <p>Blah</p>
        <p>Blah</p>
        <p>Blah</p>
        <p>Blah</p>
      </div>
    </Dialog>
  );
}
