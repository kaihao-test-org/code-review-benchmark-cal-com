import { expect, it } from "vitest";

import { getActiveQueryUnits } from "./activeUnits";

it("orders active nonyearly scopes", () => {
  expect(getActiveQueryUnits({ PER_DAY: 2, PER_MONTH: 120, PER_YEAR: 900 })).toEqual(["month", "day"]);
});
it("ignores disabled and missing scopes", () => {
  expect(getActiveQueryUnits(null)).toEqual([]);
  expect(getActiveQueryUnits({ PER_DAY: 0, PER_YEAR: 10 })).toEqual([]);
});
