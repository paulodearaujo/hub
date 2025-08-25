"use client";

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
  // hide near-zero noise
  if (hideIfZero && magnitude < 0.0005) return null;

  const isZero = magnitude < 0.0005;
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

  const display =
    variant === "percent"
      ? (() => {
          const percentValue = absValue * 100;
          const percentRounded = Math.round(percentValue * 10) / 10; // Arredonda para 1 casa decimal
          const percentIsInteger = Number.isInteger(percentRounded);
          return `${percentValue.toLocaleString("pt-BR", {
            minimumFractionDigits: percentIsInteger ? 0 : 1,
            maximumFractionDigits: 1,
          })}%`;
        })()
      : absValue.toLocaleString("pt-BR", {
          minimumFractionDigits: isInteger ? 0 : precision,
          maximumFractionDigits: precision,
        });

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
