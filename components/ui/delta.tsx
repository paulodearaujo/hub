"use client";

import { formatPercentageChange } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

// Re-export calculation utilities from lib
export {
  aggregateMetrics,
  calculateCtrPointsChange,
  calculateMetricDeltas,
  calculatePercentageChange,
  calculatePositionDelta,
  calculatePreviousCtr,
  calculatePreviousFromDeltaPct,
  splitWeeksPeriods,
  type DeltaCalculations,
  type MetricValues,
  type MetricsWithDelta,
} from "@/lib/delta-calculations";

// ============================================================================
// Visual Component Props
// ============================================================================

interface DeltaProps {
  value?: number | null; // percent as decimal if variant="percent"; else absolute units
  variant?: "percent" | "absolute";
  precision?: number; // decimals for absolute
  className?: string;
  hideIfZero?: boolean; // default true
  positiveIcon?: "up" | "down"; // visual hint: which direction indicates improvement
  suffix?: string; // optional suffix like "p.p."
}

// ============================================================================
// Visual Component
// ============================================================================

export function Delta({
  value,
  variant = "percent",
  precision = 1,
  className,
  // Keep API but unused in current visual spec
  hideIfZero: _hideIfZero = true,
  positiveIcon = "up",
  suffix,
}: DeltaProps) {
  // Mark as intentionally unused while preserving API compatibility
  void _hideIfZero;
  if (value === undefined || value === null) return null;
  const num = Number(value);

  // Handle Infinity and NaN cases - show for debugging
  if (!Number.isFinite(num)) {
    return (
      <span className={cn("text-xs text-orange-600 dark:text-orange-400", className)}>
        {Number.isNaN(num) ? "NaN" : num > 0 ? "+∞" : "-∞"}
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </span>
    );
  }

  const magnitude = Math.abs(num);

  // Check if the rounded value would be zero
  const roundedMagnitude =
    Math.round(magnitude * Math.pow(10, precision)) / Math.pow(10, precision);
  const isZero = roundedMagnitude === 0;

  const isPositive = num > 0;

  const color = isZero
    ? "text-muted-foreground"
    : isPositive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  // Usar o número original (com sinal) para display quando não for zero
  const displayValue = isZero ? 0 : num;
  const absValue = Math.abs(displayValue);

  // Para valores absolutos, verificar se é inteiro após arredondar para a precisão desejada

  // Helper function to format with decimal places and remove trailing zeros
  const formatDeltaValue = (value: number, decimals: number): string => {
    const formatted = value.toFixed(decimals);
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    return cleaned.replace(".", ","); // Convert to Brazilian standard
  };

  // Use centralized formatting functions
  // Always use consistent formatting to avoid hydration mismatches
  const display =
    variant === "percent"
      ? isZero
        ? "0%"
        : formatPercentageChange(num * 100).replace(/[+-]/, "") // Remove sign, we'll add it separately
      : isZero
        ? "0"
        : formatDeltaValue(absValue, precision); // Convert to Brazilian standard

  const Up = <IconTrendingUp className="size-3" />;
  const Down = <IconTrendingDown className="size-3" />;
  const icon = isZero
    ? null
    : isPositive
      ? positiveIcon === "down"
        ? Down
        : Up
      : positiveIcon === "down"
        ? Up
        : Down;

  // Adicionar sinal de + ou - quando não for zero
  const sign = isZero ? "" : isPositive ? "+" : "-";

  return (
    <span className={cn("flex items-center gap-1 text-xs", color, className)}>
      {icon}
      <span className="flex items-center gap-0.5">
        {sign}
        {display}
        {suffix && <span>{suffix}</span>}
      </span>
    </span>
  );
}

// ============================================================================
// Utility Functions for Delta Sorting
// ============================================================================

/**
 * Maps absolute field names to their delta equivalents
 * @param fieldName - The absolute field name (e.g., 'gsc_clicks')
 * @returns The delta field name (e.g., 'gsc_clicks_delta_pct')
 */
export function getDeltaFieldName(fieldName: string): string {
  // Special case for position - uses absolute delta instead of percentage
  if (fieldName === "gsc_position" || fieldName === "gsc_position_average") {
    return "gsc_position_delta";
  }

  // Map standard fields to their percentage delta equivalents
  const deltaFieldMap: Record<string, string> = {
    gsc_clicks: "gsc_clicks_delta_pct",
    gsc_impressions: "gsc_impressions_delta_pct",
    gsc_ctr_average: "gsc_ctr_delta", // CTR delta is in points, not percentage
    ga_users: "ga_users_delta_pct",
    ga_sessions: "ga_sessions_delta_pct",
    ga_screen_page_views: "ga_screen_page_views_delta_pct",
    ga_conversions: "ga_conversions_delta_pct",
    ga_conversion_rate: "ga_conversion_rate_delta", // Conversion rate delta is in points
    ga_average_session_duration: "ga_average_session_duration_delta_pct",
    ga_bounce_rate: "ga_bounce_rate_delta", // Bounce rate delta is in points
    ga_engagement_rate: "ga_engagement_rate_delta", // Engagement rate delta is in points
    revenue: "revenue_delta_pct",
  };

  return deltaFieldMap[fieldName] || `${fieldName}_delta_pct`;
}

/**
 * Extracts the delta sort value from a data object
 * @param data - The data object containing metrics
 * @param fieldName - The absolute field name
 * @returns The delta value for sorting (null if not available)
 */
export function getDeltaSortValue(data: any, fieldName: string): number | null {
  const deltaFieldName = getDeltaFieldName(fieldName);
  const value = data[deltaFieldName];

  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Convert to number and handle special cases
  const numValue = Number(value);

  // Handle NaN and Infinity
  if (!Number.isFinite(numValue)) {
    return null;
  }

  return numValue;
}

export default Delta;
