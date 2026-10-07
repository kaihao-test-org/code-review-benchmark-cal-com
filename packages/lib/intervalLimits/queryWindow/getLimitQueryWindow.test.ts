import { expect, it } from "vitest";

import { getLimitQueryWindow } from "./getLimitQueryWindow";

it("expands a monthly duration policy", () => {
  const result = getLimitQueryWindow("2025-01-15T10:00:00Z", "2025-01-15T11:00:00Z", null, {
    PER_MONTH: 120,
  });
  expect(result.limitDateFrom.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  expect(result.limitDateTo.toISOString()).toBe("2025-01-31T23:59:59.999Z");
});
it("keeps yearly work outside the prefetch window", () => {
  const result = getLimitQueryWindow("2025-01-15T10:00:00Z", "2025-01-15T11:00:00Z", { PER_YEAR: 10 });
  expect(result.limitDateFrom.toISOString()).toBe("2025-01-15T10:00:00.000Z");
  expect(result.limitDateTo.toISOString()).toBe("2025-01-15T11:00:00.000Z");
});
it("supports equal count and duration scopes", () => {
  const result = getLimitQueryWindow(
    "2025-01-15T10:00:00Z",
    "2025-01-15T11:00:00Z",
    { PER_DAY: 10 },
    { PER_DAY: 120 }
  );
  expect(result.limitDateFrom.toISOString()).toBe("2025-01-15T00:00:00.000Z");
  expect(result.limitDateTo.toISOString()).toBe("2025-01-15T23:59:59.999Z");
});
