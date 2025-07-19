import { useCallback, useEffect, useMemo } from "react";

export interface Shortcut {
  modifierKeys: ModifierKeyID[];
  lowercaseLetter: string;
}

// Different platforms have different styles for how to spell out keyboard
// shortcuts, so we don't attempt to generate these automatically.
export interface Instructions {
  /** User-facing text to show in instructions, e.g "Ctrl+Z". */
  text: string;

  /** A value valid to use in an aria-keyshortcuts attribute. */
  aria: string;
}

export interface ShortcutsWithInstructions {
  shortcuts: Shortcut[];
  instructions: Instructions;
}

export interface PlatformShortcuts {
  undo: ShortcutsWithInstructions;
  redo: ShortcutsWithInstructions;
}

export interface UndoRedoCallbacks {
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useUndoRedoShortcuts(
  callbacks: UndoRedoCallbacks,
): PlatformShortcuts {
  const { onUndo, onRedo } = callbacks;

  const currentPlatform = useMemo(
    () => (getIsMacKeyboard() ? SHORTCUTS.mac : SHORTCUTS.nonMac),
    [],
  );

  const {
    undo: { shortcuts: undoShortcuts },
    redo: { shortcuts: redoShortcuts },
  } = currentPlatform;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (eventShouldBeIgnored(event)) {
        // Pass.
      } else if (
        undoShortcuts.some((shortcut) => eventMatchesShortcut(event, shortcut))
      ) {
        event.preventDefault();
        onUndo?.();
      } else if (
        redoShortcuts.some((shortcut) => eventMatchesShortcut(event, shortcut))
      ) {
        onRedo?.();
      }
    },
    [undoShortcuts, redoShortcuts, onUndo, onRedo],
  );

  useEffect(() => {
    const abortController = new AbortController();
    document.addEventListener("keydown", handleKeyDown, {
      signal: abortController.signal,
    });
    return () => {
      abortController.abort();
    };
  }, [handleKeyDown]);

  return currentPlatform;
}

const SHORTCUTS: Record<"mac" | "nonMac", PlatformShortcuts> = {
  mac: {
    undo: {
      instructions: {
        text: "⌘-Z",
        aria: "meta+z",
      },
      shortcuts: [{ modifierKeys: ["metaKey"], lowercaseLetter: "z" }],
    },
    redo: {
      instructions: {
        text: "Shift-⌘-Z or ⌘-Y",
        aria: "meta+shift+z meta+y",
      },
      shortcuts: [
        { modifierKeys: ["metaKey", "shiftKey"], lowercaseLetter: "z" },
        { modifierKeys: ["metaKey"], lowercaseLetter: "y" },
      ],
    },
  },

  nonMac: {
    undo: {
      instructions: {
        text: "Ctrl+Z",
        aria: "ctrl+z",
      },
      shortcuts: [{ modifierKeys: ["ctrlKey"], lowercaseLetter: "z" }],
    },
    redo: {
      instructions: {
        text: "Ctrl+Shift+Z or Ctrl+Y",
        aria: "ctrl+shift+z ctrl+y",
      },
      shortcuts: [
        { modifierKeys: ["ctrlKey", "shiftKey"], lowercaseLetter: "z" },
        { modifierKeys: ["ctrlKey"], lowercaseLetter: "y" },
      ],
    },
  },
};

// We only want our shortcuts to trigger our custom app-wide handlers if they haven't already
// triggered something more local, like an undo inside a text input.
// This really seems like a wrong way to accomplish this--I wish I knew of something better.
// The list of elements to check against is stolen from Mousetrap: https://github.com/ccampbell/mousetrap
function eventShouldBeIgnored(event: KeyboardEvent) {
  const { target } = event;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function getIsMacKeyboard(): boolean {
  // Heuristic based on:
  // https://stackoverflow.com/questions/19877924 (older)
  // https://www.chromium.org/updates/ua-reduction/#reduced-navigatorplatform-values-for-all-versions (more recent)
  const platform = navigator.platform.toLowerCase();
  return (
    platform.includes("mac") ||
    platform.includes("iphone") ||
    platform.includes("ipad")
  );
}

function eventMatchesShortcut(event: KeyboardEvent, shortcut: Shortcut) {
  return (
    event.key.toLowerCase() === shortcut.lowercaseLetter &&
    eventHasModifierKeys(event, shortcut.modifierKeys)
  );
}

// This includes all the modifier keys, not just the ones we use in our shortcuts,
// because we want to detect if the user presses any extra modifiers--if they do,
// it should not trigger the shortcut.
const ALL_MODIFIER_KEY_IDS = [
  "altKey",
  "ctrlKey",
  "metaKey",
  "shiftKey",
] as const;
ALL_MODIFIER_KEY_IDS satisfies readonly (keyof KeyboardEvent)[];
type ModifierKeyID = (typeof ALL_MODIFIER_KEY_IDS)[number];

function eventHasModifierKeys(
  event: KeyboardEvent,
  expectedModifierKeys: ModifierKeyID[],
) {
  return ALL_MODIFIER_KEY_IDS.every((modifierKeyID) => {
    const valueFromEvent = event[modifierKeyID];
    const expectedValue = expectedModifierKeys.includes(modifierKeyID);
    return valueFromEvent === expectedValue;
  });
}
