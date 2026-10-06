import { expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("react", () => ({ useContext: () => fixture.value }));
vi.mock("../DataTableProvider", () => ({ DataTableContext: {} }));
import { useTableState } from "./useTableState";
it("rejects an absent provider", () => {
  fixture.value = null;
  expect(() => useTableState()).toThrow("useTableState must be used within a DataTableProvider");
});
it("preserves pagination state", () => {
  fixture.value = { limit: 20, offset: 40, pageIndex: 2, pageSize: 20, searchTerm: "alice" };
  expect(useTableState()).toEqual({
    state: { limit: 20, offset: 40, pageIndex: 2, pageSize: 20, searchTerm: "alice" },
  });
});
