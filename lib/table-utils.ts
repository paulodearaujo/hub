/**
 * Shared table utilities to avoid code duplication
 */

import {
  calculateCtrPointsChange,
  calculatePreviousCtr,
  getDeltaSortValue,
} from "@/components/ui/delta";

/**
 * Get sort value for a table column, handling both absolute and delta modes
 * @param row - The data row object
 * @param columnId - The column identifier
 * @param deltaMode - Whether to sort by delta values
 * @param getValue - Optional function to get value from row (for TanStack Table compatibility)
 * @returns The numeric value to sort by
 */
export function getTableSortValue<T extends Record<string, unknown>>(
  row: T,
  columnId: string,
  deltaMode: boolean,
  getValue?: (columnId: string) => unknown,
): number {
  if (deltaMode) {
    // Special handling for CTR delta
    if (columnId === "gsc_ctr") {
      // Check if pre-calculated delta exists
      const pp = row.gsc_ctr_delta;
      if (typeof pp === "number") return pp;

      // Otherwise compute via calculatePreviousCtr
      const impressions = Number(row.gsc_impressions);
      const clicks = Number(row.gsc_clicks);
      const ctr = Number(row.gsc_ctr);
      const impDelta = Number(row.gsc_impressions_delta_pct);
      const clkDelta = Number(row.gsc_clicks_delta_pct);
      if (
        !Number.isFinite(impressions) ||
        !Number.isFinite(clicks) ||
        !Number.isFinite(ctr) ||
        !Number.isFinite(impDelta) ||
        !Number.isFinite(clkDelta)
      ) {
        return Number.NaN;
      }
      const prevCtr = calculatePreviousCtr(impressions, clicks, impDelta, clkDelta);
      const change = calculateCtrPointsChange(ctr, prevCtr);
      return Number.isFinite(change) ? change : Number.NaN;
    }

    // Use the delta utility function for other fields
    const deltaValue = getDeltaSortValue(row as Record<string, unknown>, columnId);
    if (deltaValue === null) {
      const v = getValue ? getValue(columnId) : (row as Record<string, unknown>)[columnId];
      return typeof v === "number" ? v : Number(v);
    }
    return deltaValue;
  }

  // Use absolute value
  const value = getValue ? getValue(columnId) : (row as Record<string, unknown>)[columnId];
  return typeof value === "number" ? value : Number(value);
}
