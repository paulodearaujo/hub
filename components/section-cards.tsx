"use client";

import {
  Card,
  CardAction,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Delta, calculateMetricDeltas, type MetricsWithDelta } from "@/components/ui/delta";
import { formatCtr, formatNumber, formatPosition } from "@/lib/formatters";
import {
  IconClick,
  IconEye,
  IconInnerShadowTop,
  IconPercentage,
  IconShoppingCart,
} from "@tabler/icons-react";

interface SectionCardsProps {
  metrics: MetricsWithDelta;
}

export function SectionCards({ metrics }: SectionCardsProps) {
  // Use centralized delta calculations
  const deltas = calculateMetricDeltas(metrics, metrics.previousPeriod);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-5">
      {/* Conversões Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <IconShoppingCart className="size-3.5 text-muted-foreground" />
            Conversões
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.conversions)}
          </CardTitle>
          <CardAction>
            <Delta value={deltas.conversionsChange} variant="percent" />
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Consectetur adipiscing elit sed do</div>
        </CardFooter> */}
      </Card>

      {/* Impressões Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <IconEye className="size-3.5 text-muted-foreground" />
            Impressões
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.impressions)}
          </CardTitle>
          <CardAction>
            <Delta value={deltas.impressionsChange} variant="percent" />
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Eiusmod tempor incididunt ut labore</div>
        </CardFooter> */}
      </Card>

      {/* CTR Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <IconPercentage className="size-3.5 text-muted-foreground" />
            CTR
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCtr(metrics.ctr)}
          </CardTitle>
          <CardAction>
            <Delta value={deltas.ctrChange} variant="absolute" precision={2} suffix="p.p." />
          </CardAction>
        </CardHeader>
      </Card>

      {/* Cliques Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <IconClick className="size-3.5 text-muted-foreground" />
            Cliques
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(metrics.clicks)}
          </CardTitle>
          <CardAction>
            <Delta value={deltas.clicksChange} variant="percent" />
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Ut enim ad minim veniam quis</div>
        </CardFooter> */}
      </Card>

      {/* Posição Média Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <IconInnerShadowTop className="size-3.5 text-muted-foreground" />
            Posição Média
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPosition(metrics.position)}
          </CardTitle>
          <CardAction>
            <Delta
              value={deltas.positionChange}
              variant="absolute"
              precision={1}
              positiveIcon="down"
            />
          </CardAction>
        </CardHeader>
        {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">Lorem ipsum dolor sit amet</div>
          <div className="text-muted-foreground">Nostrud exercitation ullamco laboris</div>
        </CardFooter> */}
      </Card>
    </div>
  );
}
