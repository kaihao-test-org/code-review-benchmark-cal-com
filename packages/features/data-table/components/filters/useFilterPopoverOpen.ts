import { useState, useEffect, useCallback } from "react";

import { useTableState } from "../../hooks";

export function useFilterPopoverOpen(columnId: string) {
  const { filterToOpen } = useTableState().state;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (filterToOpen.current === columnId) {
      timeoutId = setTimeout(() => {
        setOpen(true);
      }, 0);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [filterToOpen, columnId]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (filterToOpen.current === columnId && !open) {
        filterToOpen.current = undefined;
      }
      setOpen(open);
    },
    [filterToOpen, columnId]
  );

  return { open, onOpenChange };
}
