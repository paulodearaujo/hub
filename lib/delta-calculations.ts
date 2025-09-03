// ============================================================================
// Delta Calculation Utilities
// Pure functions for metric calculations - can be used on server or client
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface MetricValues {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr?: number | undefined;
  position?: number | undefined;
}

export interface MetricsWithDelta extends MetricValues {
  previousPeriod?: MetricValues;
}

export interface DeltaCalculations {
  impressionsChange: number; // percentage change as decimal
  clicksChange: number; // percentage change as decimal
  conversionsChange: number; // percentage change as decimal
  ctrChange: number; // absolute change in percentage points
  positionChange: number; // absolute change (negative is better)
}

// ============================================================================
// Calculation Functions (Pure, Testable, DRY)
// ============================================================================

/**
 * Calculate percentage change between two values
 * Returns 0 if previous is 0 or undefined
 */
export function calculatePercentageChange(current: number, previous?: number): number {
  // Treat "novo" case: if previous is 0 and current > 0, surface +Infinity
  if (previous === 0) {
    return current > 0 ? Number.POSITIVE_INFINITY : 0;
  }
  if (!previous) return 0;
  return (current - previous) / previous;
}

/**
 * Calculate position delta (improvement is previous - current)
 * Lower position is better, so improvement means current < previous
 */
export function calculatePositionDelta(current?: number, previous?: number): number {
  if (!previous || previous === 0 || current === undefined) return 0;
  return previous - current;
}

/**
 * Calculate CTR change in percentage points (not percentage change)
 * E.g., from 2% to 3% = +1 percentage point
 */
export function calculateCtrPointsChange(current?: number, previous?: number): number {
  const cur = current ?? 0;
  const prev = previous ?? 0;

  // CTR now provided as decimal (0–1). Convert both to percentage points.
  const curPercent = cur * 100;
  const prevPercent = prev * 100;

  const delta = curPercent - prevPercent;

  // Return delta as-is, even if Infinity/NaN for debugging
  return delta;
}

/**
 * Calculate previous value from current value and percentage change
 * Used to reverse-engineer previous metrics from current + delta percentage
 */
export function calculatePreviousFromDeltaPct(current: number, deltaPct: number): number {
  // Handle edge cases: -100% would divide by zero
  if (deltaPct <= -1) {
    return 0;
  }
  // Let Infinity/NaN propagate for debugging visibility
  return current / (1 + deltaPct);
}

/**
 * Calculate previous CTR from current metrics and delta percentages
 * Useful when you have current values and their percentage changes
 */
export function calculatePreviousCtr(
  currentImpressions: number,
  currentClicks: number,
  impressionsDeltaPct?: number,
  clicksDeltaPct?: number,
): number {
  const prevImpr = calculatePreviousFromDeltaPct(currentImpressions, impressionsDeltaPct ?? 0);
  const prevClicks = calculatePreviousFromDeltaPct(currentClicks, clicksDeltaPct ?? 0);
  return prevImpr > 0 ? prevClicks / prevImpr : 0;
}

/**
 * Calculate all delta values for a set of metrics
 * Single source of truth for delta calculations
 */
export function calculateMetricDeltas(
  current: MetricValues,
  previous?: MetricValues,
): DeltaCalculations {
  return {
    impressionsChange: calculatePercentageChange(current.impressions, previous?.impressions),
    clicksChange: calculatePercentageChange(current.clicks, previous?.clicks),
    conversionsChange: calculatePercentageChange(current.conversions, previous?.conversions),
    ctrChange: calculateCtrPointsChange(current.ctr, previous?.ctr),
    positionChange: calculatePositionDelta(current.position, previous?.position),
  };
}

/**
 * Split weeks into early and late periods for comparison
 * Early period = first half, Late period = second half
 */
export function splitWeeksPeriods(weeks: string[]): { early: Set<string>; late: Set<string> } {
  const sorted = [...weeks].sort((a, b) => a.localeCompare(b));
  const mid = Math.floor(sorted.length / 2);
  return {
    early: new Set(sorted.slice(0, mid)),
    late: new Set(sorted.slice(mid)),
  };
}

/**
 * Aggregate metrics from weekly data
 * Handles weighted averages for position and CTR
 */
export function aggregateMetrics(
  data: Array<{
    gsc_impressions?: number | null;
    gsc_clicks?: number | null;
    gsc_position?: number | null;
    amplitude_conversions?: number | null;
    week_ending?: string | null;
  }>,
  weekFilter?: Set<string>,
): MetricValues & { _posWeighted?: number } {
  const result = data.reduce(
    (acc, item) => {
      // Skip if weekFilter is provided and week doesn't match
      if (weekFilter && (!item.week_ending || !weekFilter.has(item.week_ending))) {
        return acc;
      }

      const impressions = item.gsc_impressions || 0;
      const clicks = item.gsc_clicks || 0;
      const conversions = item.amplitude_conversions || 0;
      const position = item.gsc_position || 0;

      acc.impressions += impressions;
      acc.clicks += clicks;
      acc.conversions += conversions;
      acc._posWeighted += position * impressions;

      return acc;
    },
    { impressions: 0, clicks: 0, conversions: 0, _posWeighted: 0 },
  );

  // Calculate weighted average position and CTR
  const position = result.impressions > 0 ? result._posWeighted / result.impressions : 0;
  const ctr = result.impressions > 0 ? result.clicks / result.impressions : 0;

  return {
    impressions: result.impressions,
    clicks: result.clicks,
    conversions: result.conversions,
    ctr,
    position,
    _posWeighted: result._posWeighted,
  };
}

/**
 * Centralized function to calculate metrics with proper deltas
 * This is the SINGLE SOURCE OF TRUTH for delta calculations
 *
 * @param baseData - Data for the selected period
 * @param deltaData - Data for delta calculation (may include previous week)
 * @returns Metrics ready for display with consistent deltas
 */
export function calculateMetricsWithDeltas(
  baseData: Array<{
    gsc_impressions?: number | null;
    gsc_clicks?: number | null;
    gsc_position?: number | null;
    amplitude_conversions?: number | null;
    week_ending?: string | null;
  }>,
  deltaData?: Array<{
    gsc_impressions?: number | null;
    gsc_clicks?: number | null;
    gsc_position?: number | null;
    amplitude_conversions?: number | null;
    week_ending?: string | null;
  }>,
): MetricsWithDelta {
  // Calculate totals for the selected period
  const totals = aggregateMetrics(baseData);

  // If no delta data or only one week, return totals without deltas
  if (!deltaData || deltaData.length === 0) {
    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      conversions: totals.conversions,
      ctr: totals.ctr,
      position: totals.position,
    };
  }

  // Get unique weeks from delta data
  const weeks = [...new Set(deltaData.map((d) => d.week_ending).filter(Boolean))] as string[];

  // If only one week, no delta calculation possible
  if (weeks.length <= 1) {
    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      conversions: totals.conversions,
      ctr: totals.ctr,
      position: totals.position,
    };
  }

  // Split weeks into early and late periods
  const { early, late } = splitWeeksPeriods(weeks);

  // Calculate early and late metrics
  const earlyMetrics = aggregateMetrics(deltaData, early);
  const lateMetrics = aggregateMetrics(deltaData, late);

  // For dashboard consistency: deltas are (late - early) / early
  // But we display totals, not late values
  // So we need to return totals with a previousPeriod that will produce the right delta

  // The delta we want to show is (late - early) / early
  // But SectionCards calculates (current - previous) / previous
  // If we show totals, we need: (totals - X) / X = (late - early) / early
  // Solving for X: X = totals * early / late (when late > 0)

  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    conversions: totals.conversions,
    ctr: totals.ctr,
    position: totals.position,
    previousPeriod: {
      impressions:
        lateMetrics.impressions > 0
          ? (totals.impressions * earlyMetrics.impressions) / lateMetrics.impressions
          : earlyMetrics.impressions,
      clicks:
        lateMetrics.clicks > 0
          ? (totals.clicks * earlyMetrics.clicks) / lateMetrics.clicks
          : earlyMetrics.clicks,
      conversions:
        lateMetrics.conversions > 0
          ? (totals.conversions * earlyMetrics.conversions) / lateMetrics.conversions
          : earlyMetrics.conversions,
      ctr: earlyMetrics.ctr,
      position: earlyMetrics.position,
    },
  };
}
