import zip from "lodash/zip";

/**
 * [1, 2, 3], ["a", "b", "c"] --> [[1, "a"], [2, "b"], [3, "c"]]
 *
 * Like lodash's zip(), but require the arrays to be of equal length, so the result
 * won't contain undefineds.
 */
export function zipEqualLength<T, U>(ts: T[], us: U[]): [T, U][] {
  if (ts.length != us.length) {
    throw new Error(
      `Array lengths don't match: ${ts.length}, ${us.length}`,
      {},
    );
  }
  // @ts-expect-error Elements won't actually be undefined as long as lengths match.
  return zip(ts, us);
}
