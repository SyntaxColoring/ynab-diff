// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSelectYNABAccount } from "./useSelectYNABAccount";

describe("useSelectYNABAccount()", () => {
  it("should default to no selection, and let you set the selection", () => {
    const options = ["option 1", "option 2"];

    const { rerender, result } = renderHook(() =>
      useSelectYNABAccount(options),
    );
    expect(result.current.selection).toStrictEqual(null);

    result.current.setSelection(options[1]);
    rerender();
    expect(result.current.selection).toStrictEqual(options[1]);
  });

  it("should auto-select if there is only one option available", () => {
    const { result, rerender } = renderHook(
      ({ options }: { options: string[] }) => useSelectYNABAccount(options),
      { initialProps: { options: ["option 1"] } },
    );
    expect(result.current.selection).toStrictEqual("option 1");

    rerender({ options: ["option 2"] });
    expect(result.current.selection).toStrictEqual("option 2");
  });

  it("should retain the selection, if possible, when the available options change, or clear it otherwise", () => {
    const { result, rerender } = renderHook(
      ({ options }: { options: string[] }) => useSelectYNABAccount(options),
      { initialProps: { options: ["option 1", "option 2", "option 3"] } },
    );
    result.current.setSelection("option 3");
    rerender({ options: ["option 1", "option 2", "option 3"] });
    expect(result.current.selection).toStrictEqual("option 3");

    rerender({ options: ["option 3", "option 4", "option 5"] });
    expect(result.current.selection).toStrictEqual("option 3");

    rerender({ options: ["option 5", "option 6", "option 7"] });
    expect(result.current.selection).toStrictEqual(null);
  });
});
