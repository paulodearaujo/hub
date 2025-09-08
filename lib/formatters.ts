/**
 * Centralized formatting functions for consistent number display across the app
 * Following UX best practices for readability while maintaining precision
 *
 * IMPORTANT: All functions use "pt-BR" locale (Brazilian standard)
 * to ensure consistency between server and client rendering
 */

import { format, parseISO, startOfWeek } from "date-fns";

// Helper function to convert dot to comma (Brazilian standard)
const toBrazilian = (value: string): string => value.replace(".", ",");

// Helper function to check if value is valid
const isValid = (value: number | null | undefined): value is number => {
  return value != null && !Number.isNaN(value);
};

// Helper function to format with decimal places and remove trailing zeros
const formatDecimal = (value: number, decimals: number): string => {
  const formatted = value.toFixed(decimals);
  // Remove trailing zeros after decimal point
  const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  return toBrazilian(cleaned);
};

/**
 * Format large numbers with thousand separators
 * Uses Brazilian standard: dot as thousand separator
 * Used for: Impressions, Clicks, Conversions
 * @example formatNumber(1234567) => "1.234.567"
 */
export function formatNumber(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0";
  // Always use pt-BR locale for consistency across server/client
  return Math.round(value).toLocaleString("pt-BR");
}

/**
 * Format compact numbers for space-constrained areas
 * Uses Brazilian standard: comma as decimal separator
 * @example formatCompactNumber(1234567) => "1,2M"
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0";

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${formatDecimal(value / 1_000_000, 1)}M`;
  }
  if (absValue >= 10_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  if (absValue >= 1_000) {
    return `${formatDecimal(value / 1_000, 1)}k`;
  }

  return Math.round(value).toString();
}

/**
 * Format CTR as percentage with 2 decimal places
 * Uses Brazilian standard: comma as decimal separator
 * Banco agora entrega CTR como decimal (0–1); sempre convertemos para %.
 * @example formatCtr(0.04523) => "4,52%"
 */
export function formatCtr(value: number | null | undefined): string {
  if (!isValid(value)) return "0%";

  // Valor é decimal (0–1). Converter para percentual.
  const percentage = value * 100;
  if (percentage === 0) return "0%";

  return `${formatDecimal(percentage, 2)}%`;
}

/**
 * Format position with 1 decimal place
 * Uses Brazilian standard: comma as decimal separator
 * @example formatPosition(12.567) => "12,6"
 */
export function formatPosition(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0";
  return formatDecimal(value, 1);
}

/**
 * Format week display showing date range
 * @param weekEnding - ISO date string of week ending
 * @returns Formatted string like "01/01 - 07/01/2024"
 */
export function formatWeekDisplay(weekEnding: string): string {
  const date = parseISO(weekEnding);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return `${format(weekStart, "dd/MM")} - ${format(date, "dd/MM/yyyy")}`;
}

/**
 * Format percentage change with 1 decimal place
 * Uses Brazilian standard: comma as decimal separator
 * Used for: All percentage deltas
 * @example formatPercentageChange(15.367) => "+15,4%"
 * @example formatPercentageChange(-8.723) => "-8,7%"
 */
export function formatPercentageChange(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0%";

  const absValue = Math.abs(value);
  const formatted = formatDecimal(absValue, 1);
  const sign = value > 0 ? "+" : "-";

  return `${sign}${formatted}%`;
}

/**
 * Format percentage points change (for CTR)
 * Uses Brazilian standard: comma as decimal separator
 * @example formatPercentagePoints(2.34) => "+2,3pp"
 * @example formatPercentagePoints(-1.56) => "-1,6pp"
 */
export function formatPercentagePoints(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0pp";

  const absValue = Math.abs(value);
  const formatted = formatDecimal(absValue, 1);
  const sign = value > 0 ? "+" : "-";

  return `${sign}${formatted}pp`;
}

/**
 * Format position change with arrow indicators
 * Uses Brazilian standard: comma as decimal separator
 * @example formatPositionChange(-2.3) => "↑ 2,3"
 * @example formatPositionChange(1.5) => "↓ 1,5"
 */
export function formatPositionChange(value: number | null | undefined): string {
  if (!isValid(value) || Math.abs(value) < 0.05) return "→ 0";

  // Remember: lower position is better
  const arrow = value < 0 ? "↑" : "↓";
  const formatted = formatDecimal(Math.abs(value), 1);

  return `${arrow} ${formatted}`;
}

/**
 * Format delta value with appropriate sign
 * Used for: Generic delta displays
 * @example formatDelta(123) => "+123"
 * @example formatDelta(-456) => "-456"
 */
export function formatDelta(value: number | null | undefined): string {
  if (!isValid(value) || value === 0) return "0";

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

/**
 * Format currency values in Brazilian Real
 * @example formatCurrency(1234.56) => "R$ 1.234,56"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (!isValid(value)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date for display in Brazilian format
 * @example formatDate("2024-12-08") => "8 de dez. de 2024"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format week ending date in Brazilian format
 * @example formatWeekEnding("2024-12-08") => "Semana de 8 de dez."
 */
export function formatWeekEnding(date: string | null | undefined): string {
  if (!date) return "";

  const dateObj = new Date(date);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    day: "numeric",
  }).format(dateObj);

  return `Semana de ${formatted}`;
}

/**
 * Determines if a change is significant enough to highlight
 * @param value - The percentage change value
 * @param threshold - The threshold for significance (default: 5%)
 */
export function isSignificantChange(value: number | null | undefined, threshold = 5): boolean {
  if (!isValid(value)) return false;
  return Math.abs(value) >= threshold;
}

/**
 * Get color class based on delta value
 * Used for consistent coloring across the app
 */
export function getDeltaColorClass(value: number | null | undefined, inverted = false): string {
  if (!isValid(value) || value === 0) {
    return "text-muted-foreground";
  }

  const isPositive = inverted ? value < 0 : value > 0;
  return isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
}

/**
 * Format metric for tooltip display
 * Provides more precision for hover states
 */
export function formatTooltipValue(
  value: number | null | undefined,
  type: "number" | "percentage" | "position" | "ctr" = "number",
): string {
  if (!isValid(value)) return "N/A";

  switch (type) {
    case "percentage":
      return `${formatDecimal(value * 100, 3)}%`;
    case "ctr":
      return `${formatDecimal(value * 100, 4)}%`;
    case "position":
      return formatDecimal(value, 2);
    default:
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  }
}

// Export a preset object for easy access
export const formatters = {
  number: formatNumber,
  compact: formatCompactNumber,
  ctr: formatCtr,
  position: formatPosition,
  percentageChange: formatPercentageChange,
  percentagePoints: formatPercentagePoints,
  positionChange: formatPositionChange,
  delta: formatDelta,
  currency: formatCurrency,
  date: formatDate,
  weekEnding: formatWeekEnding,
  tooltipValue: formatTooltipValue,
} as const;

// Type-safe formatter selector
export type FormatterType = keyof typeof formatters;

// Extra helpers for cluster quality metrics near 1.0
export function formatQualityPercent(value: number | null | undefined, digits = 3): string {
  if (!isValid(value)) return "—";
  // Convert to % and clamp to just below 100 if value < 1 to avoid rounding to 100.00%
  const pct = value * 100;
  const clamped = value < 1 ? Math.min(pct, 99.9999) : pct;
  return `${formatDecimal(clamped, digits)}%`;
}

export function formatQualityGapBp(value: number | null | undefined, digits = 1): string {
  if (!isValid(value)) return "—";
  const gapBp = (1 - value) * 10000; // basis points
  return `${formatDecimal(gapBp, digits)} bp`;
}
