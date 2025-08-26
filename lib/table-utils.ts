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
export function getTableSortValue<T extends Record<string, any>>(
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
      const ctr = row.gsc_ctr || 0;
      const prevCtr = calculatePreviousCtr(
        row.gsc_impressions,
        row.gsc_clicks,
        row.gsc_impressions_delta_pct,
        row.gsc_clicks_delta_pct,
      );
      const change = calculateCtrPointsChange(ctr, prevCtr);
      return Number.isFinite(change) ? change : 0;
    }

    // Use the delta utility function for other fields
    const deltaValue = getDeltaSortValue(row, columnId);
    if (deltaValue === null) {
      const v = getValue ? getValue(columnId) : row[columnId];
      return typeof v === "number" ? v : 0;
    }
    return deltaValue;
  }

  // Use absolute value
  const value = getValue ? getValue(columnId) : row[columnId];
  return typeof value === "number" ? value : 0;
}
