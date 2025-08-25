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
  hideIfZero = true,
  positiveIcon = "up",
  suffix,
}: DeltaProps) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
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
  const roundedValue = Math.round(absValue * Math.pow(10, precision)) / Math.pow(10, precision);
  const isInteger = Number.isInteger(roundedValue);

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

export default Delta;
