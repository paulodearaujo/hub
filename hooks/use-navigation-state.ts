"use client";

import * as React from "react";

/**
 * Hook to manage navigation pending state
 * Eliminates duplicate code in wrapper components
 */
export function useNavigationState() {
  const [isPending, setIsPending] = React.useState(false);

  const handleNavigationState = React.useCallback((pending: boolean) => {
    setIsPending(pending);
  }, []);

  return {
    isPending,
    handleNavigationState,
  };
}
