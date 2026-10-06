import { useContext } from "react";

import { DataTableContext } from "../DataTableProvider";

export function useTableState() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useTableState must be used within a DataTableProvider");
  }
  return { state: context };
}
