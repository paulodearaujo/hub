"use client";

import {
  IconClick,
  IconEye,
  IconInnerShadowTop,
  IconPercentage,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateMetricDeltas, Delta, type MetricsWithDelta } from "@/components/ui/delta";
import { formatCompactNumber, formatCtr, formatNumber, formatPosition } from "@/lib/formatters";

interface SectionCardsProps {
  metrics: MetricsWithDelta;
}

export function SectionCards({ metrics }: SectionCardsProps) {
  // Use centralized delta calculations
  const deltas = calculateMetricDeltas(metrics, metrics.previousPeriod);

  // Helper to format numbers based on size to avoid overflow
  const formatSmartNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "0";
    // Use compact format for numbers > 999.999.999 to prevent overflow
    return value > 999_999_999 ? formatCompactNumber(value) : formatNumber(value);
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-5">
      {/* Conversões Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconShoppingCart className="size-3.5 text-muted-foreground" />
              Conversões
            </div>
            <Delta value={deltas.conversionsChange} variant="percent" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatSmartNumber(metrics.conversions)}
          </CardTitle>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Consectetur adipiscing elit sed do</div>
        </CardFooter> */}
      </Card>

      {/* Impressões Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconEye className="size-3.5 text-muted-foreground" />
              Impressões
            </div>
            <Delta value={deltas.impressionsChange} variant="percent" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatSmartNumber(metrics.impressions)}
          </CardTitle>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Eiusmod tempor incididunt ut labore</div>
        </CardFooter> */}
      </Card>

      {/* CTR Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconPercentage className="size-3.5 text-muted-foreground" />
              CTR
            </div>
            <Delta value={deltas.ctrChange} variant="absolute" precision={2} suffix="p.p." />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCtr(metrics.ctr)}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Cliques Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconClick className="size-3.5 text-muted-foreground" />
              Cliques
            </div>
            <Delta value={deltas.clicksChange} variant="percent" />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatSmartNumber(metrics.clicks)}
          </CardTitle>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Ut enim ad minim veniam quis</div>
        </CardFooter> */}
      </Card>

      {/* Posição Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconInnerShadowTop className="size-3.5 text-muted-foreground" />
              Posição
            </div>
            <Delta
              value={deltas.positionChange}
              variant="absolute"
              precision={1}
              positiveIcon="down"
            />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPosition(metrics.position)}
          </CardTitle>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Nostrud exercitation ullamco laboris</div>
        </CardFooter> */}
      </Card>
    </div>
  );
}
