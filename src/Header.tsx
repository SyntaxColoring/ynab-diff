import { Redo2, Undo2 } from "lucide-react";
import { useCallback } from "react";
import { ActionCreators as ReduxUndoActionCreators } from "redux-undo";

import { Button } from "./components/Button";
import { Select } from "./components/Select";
import { CURRENCY_CODES } from "./currencyFormatting";
import { setCurrencyFormat } from "./redux/currencyFormatSlice";
import { useAppDispatch, useAppSelector } from "./redux/typedHooks";
import { useUndoRedoShortcuts } from "./useUndoRedoShortcuts";

export function Header(): React.JSX.Element {
  // TODO: Title, about, contact, and stuff currency dropdown into a settings dialog
  return (
    <header className="flex gap-8 items-center justify-between">
      <UndoRedoButtons />
      <CurrencySelector />
    </header>
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
    <div className="flex gap-2">
      <Button
        variant="secondary"
        onClick={handleUndo}
        disabled={!canUndo}
        title={`Undo (${shortcuts.undo.instructions.text})`}
        // TODO: aria-keyshortcuts is read redundantly with title. Does it make sense to use both?
        aria-keyshortcuts={shortcuts.undo.instructions.aria}
      >
        <span className="flex gap-1 items-center">
          <Undo2 height="20px" />
          <span>Undo</span>
        </span>
      </Button>
      <Button
        variant="secondary"
        onClick={handleRedo}
        disabled={!canRedo}
        title={`Redo (${shortcuts.redo.instructions.text})`}
        // TODO: aria-keyshortcuts is read redundantly with title. Does it make sense to use both?
        aria-keyshortcuts={shortcuts.redo.instructions.aria}
      >
        <span className="flex gap-1 items-center">
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
    <label className="flex gap-2">
      <span>Currency format</span>
      <Select
        options={CURRENCY_CODES}
        value={currencyCode}
        onChange={(value) => dispatch(setCurrencyFormat(value))}
      />
    </label>
  );
}
