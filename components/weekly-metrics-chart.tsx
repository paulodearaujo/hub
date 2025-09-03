"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Tables } from "@/lib/database.types";
import { formatCtr, formatNumber, formatPosition } from "@/lib/formatters";
import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

// Constantes de configuração
const DAYS_PER_WEEK = 7;

// Usando tipo do banco de dados com campos opcionais para dados agregados
type WeeklyMetric = Partial<Tables<"blog_articles_metrics">>;
type NormalizedMetric = WeeklyMetric & {
  amplitude_conversions_n: number | null;
  gsc_clicks_n: number | null;
  gsc_impressions_n: number | null;
  gsc_ctr_n: number | null;
  gsc_position_n: number | null;
};

interface WeeklyMetricsChartProps {
  data?: WeeklyMetric[];
  selectedWeeks?: string[];
}

const chartConfig = {
  amplitude_conversions: { label: "Conversões", color: "var(--chart-2)" },
  gsc_impressions: { label: "Impressões", color: "var(--chart-3)" },
  gsc_ctr: { label: "CTR", color: "var(--chart-5)" },
  gsc_clicks: { label: "Cliques", color: "var(--chart-1)" },
  gsc_position: { label: "Posição Média", color: "var(--chart-6)" },
} satisfies ChartConfig;

export function WeeklyMetricsChart({ data = [], selectedWeeks = [] }: WeeklyMetricsChartProps) {
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>([
    "amplitude_conversions",
    "gsc_impressions",
    "gsc_ctr",
    "gsc_clicks",
    "gsc_position",
  ]);

  // Internal ready state to control skeleton overlay precisely
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setReady(true);
      });
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  const filteredData = React.useMemo<WeeklyMetric[]>(() => {
    if (!data || data.length === 0) return [];

    // Sort data by week (string ISO date) and prepare values
    const sortedData = [...data]
      .filter((item) => item.week_ending)
      .sort((a, b) => (a.week_ending as string).localeCompare(b.week_ending as string))
      .map((item) => ({
        ...item,
        // Keep gsc_ctr as null to satisfy exactOptionalPropertyTypes while not using it
        gsc_ctr: item.gsc_ctr ?? null,
        gsc_position: item.gsc_position ?? null,
      }));

    // Optional: Fill in missing weeks with null values to show gaps in the chart
    // This helps visualize when data is missing
    if (sortedData.length > 1) {
      const filledData: WeeklyMetric[] = [];
      const firstItem = sortedData[0];
      const lastItem = sortedData[sortedData.length - 1];

      if (!firstItem?.week_ending || !lastItem?.week_ending) {
        return sortedData;
      }

      // Use UTC-midday to avoid timezone shifts and add days via timestamps
      const parseUtcMid = (s: string) => new Date(`${s}T12:00:00Z`);
      const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

      const startDate = parseUtcMid(firstItem.week_ending);
      const endDate = parseUtcMid(lastItem.week_ending);

      let currentDate = new Date(startDate.getTime());
      let dataIndex = 0;

      while (currentDate <= endDate) {
        const weekString = currentDate.toISOString().split("T")[0];
        const currentDataItem = sortedData[dataIndex];

        if (
          dataIndex < sortedData.length &&
          currentDataItem &&
          currentDataItem.week_ending === weekString
        ) {
          filledData.push(currentDataItem);
          dataIndex++;
        } else {
          // Add placeholder for missing week - this will create a gap in the line
          filledData.push({
            week_ending: weekString,
            gsc_clicks: null,
            gsc_impressions: null,
            amplitude_conversions: null,
            gsc_ctr: null,
            gsc_position: null,
          } as WeeklyMetric);
        }

        // Move to next week using ms arithmetic to keep UTC safe
        currentDate = addDays(currentDate, DAYS_PER_WEEK);
      }

      return filledData;
    }

    return sortedData as WeeklyMetric[];
  }, [data]);

  // Build normalized dataset (0-100) per metric for better comparison in a single scale
  const normalizedData = React.useMemo<NormalizedMetric[]>(() => {
    if (!filteredData || filteredData.length === 0) return [] as NormalizedMetric[];

    const maxValues = {
      amplitude_conversions: Math.max(
        ...filteredData.map((d) =>
          d.amplitude_conversions == null ? 0 : Number(d.amplitude_conversions),
        ),
      ),
      gsc_clicks: Math.max(
        ...filteredData.map((d) => (d.gsc_clicks == null ? 0 : Number(d.gsc_clicks))),
      ),
      gsc_impressions: Math.max(
        ...filteredData.map((d) => (d.gsc_impressions == null ? 0 : Number(d.gsc_impressions))),
      ),
      gsc_ctr: Math.max(...filteredData.map((d) => (d.gsc_ctr == null ? 0 : Number(d.gsc_ctr)))),
      // handled separately for inversion
    };
    const posNums = filteredData
      .map((d) => (d.gsc_position == null ? null : Number(d.gsc_position)))
      .filter((v): v is number => typeof v === "number");
    const maxPos = posNums.length > 0 ? Math.max(...posNums) : 0;
    const minPos = posNums.length > 0 ? Math.min(...posNums) : 0;
    const _posDen = Math.max(1, maxPos - minPos);

    const clampDiv = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);

    return filteredData.map((d) => ({
      ...d,
      amplitude_conversions_n:
        d.amplitude_conversions == null
          ? null
          : clampDiv(Number(d.amplitude_conversions), maxValues.amplitude_conversions),
      gsc_clicks_n:
        d.gsc_clicks == null ? null : clampDiv(Number(d.gsc_clicks), maxValues.gsc_clicks),
      gsc_impressions_n:
        d.gsc_impressions == null
          ? null
          : clampDiv(Number(d.gsc_impressions), maxValues.gsc_impressions),
      gsc_ctr_n: d.gsc_ctr == null ? null : clampDiv(Number(d.gsc_ctr), maxValues.gsc_ctr),
      // Posição: normalizada sem inversão (valor maior = linha sobe)
      gsc_position_n:
        d.gsc_position == null ? null : clampDiv(Number(d.gsc_position) - minPos, _posDen),
    }));
  }, [filteredData]);

  const chartData: NormalizedMetric[] = normalizedData;
  // Label pluralization for week count (DRY)
  const weeksCount = selectedWeeks.length;
  const formatWeeksLabel = (fallback: string) =>
    weeksCount > 0 ? `${weeksCount} ${weeksCount === 1 ? "semana" : "semanas"}` : fallback;
  const desktopWeeksLabel = formatWeeksLabel("32 semanas");
  const mobileWeeksLabel = formatWeeksLabel("Todas as semanas");

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Métricas Semanais</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {desktopWeeksLabel} | Indexado em 0-100
            {filteredData.some((d) => d.gsc_clicks === null) && (
              <span className="ml-2 text-destructive">⚠️ Dados faltando em algumas semanas</span>
            )}
          </span>
          <span className="@[540px]/card:hidden">
            {mobileWeeksLabel}
            {filteredData.some((d) => d.gsc_clicks === null) && " ⚠️"}
          </span>
        </CardDescription>
        <CardAction>
          {/* Escala fixa indexada para clareza visual */}
          <ToggleGroup
            type="multiple"
            value={selectedMetrics}
            onValueChange={(value: string[]) => {
              if (value.length > 0) {
                setSelectedMetrics(value);
              }
            }}
            variant="outline"
            className="flex flex-wrap gap-0 *:data-[slot=toggle-group-item]:!px-5 *:data-[slot=toggle-group-item]:!h-9 *:data-[slot=toggle-group-item]:text-sm *:data-[slot=toggle-group-item]:font-medium"
          >
            <ToggleGroupItem value="amplitude_conversions" aria-label="Conversões">
              Conversões
            </ToggleGroupItem>
            <ToggleGroupItem value="gsc_impressions" aria-label="Impressões">
              Impressões
            </ToggleGroupItem>
            <ToggleGroupItem value="gsc_ctr" aria-label="CTR">
              CTR
            </ToggleGroupItem>
            <ToggleGroupItem value="gsc_clicks" aria-label="Cliques">
              Cliques
            </ToggleGroupItem>
            <ToggleGroupItem value="gsc_position" aria-label="Posição">
              Posição
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="relative">
          {!ready && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="h-[220px] sm:h-[250px] w-full" />
            </div>
          )}
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[220px] sm:h-[250px] w-full"
          >
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week_ending"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
                  // Show week ending date to emphasize "semana por semana"
                  const [y, m, d] = (value || "").split("-");
                  if (!y || !m || !d) return value;
                  return `Sem ${d}/${m}`;
                }}
              />
              {/* Single Y-axis for all metrics */}
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) => {
                      const [y, m, d] = (value || "").split("-");
                      if (!y || !m || !d) return value;
                      const endLabel = `Semana ${d}/${m}/${y}`;
                      if (selectedWeeks.length === 1) {
                        return `${endLabel}${value === selectedWeeks[0] ? " (Atual)" : " (Anterior)"}`;
                      }
                      return endLabel;
                    }}
                    formatter={(value, name, item) => {
                      // Skip null values
                      if (value === null || value === undefined) return null;

                      const config = chartConfig[name as keyof typeof chartConfig];
                      const label = config?.label || name;
                      const color = item?.color || config?.color;

                      // Mostrar sempre os valores absolutos no tooltip
                      let formattedValue = "";
                      const baseKey = (name as string).replace(/_n$/, "");
                      const original = item?.payload?.[baseKey as keyof typeof item.payload] as
                        | number
                        | undefined;
                      if ((name as string).startsWith("gsc_position")) {
                        const n = Number(original ?? 0);
                        formattedValue = formatPosition(n);
                      } else if ((name as string).startsWith("gsc_ctr")) {
                        const n = Number(original ?? 0);
                        formattedValue = formatCtr(n);
                      } else {
                        const n = Number(original ?? 0);
                        formattedValue = formatNumber(n);
                      }

                      // Return JSX with colored dot, label and value
                      return (
                        <>
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex flex-1 justify-between items-center gap-2">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {formattedValue}
                            </span>
                          </div>
                        </>
                      );
                    }}
                    indicator="dot"
                  />
                }
              />
              {/* Render all lines with stable order; toggle via `hide` and remount the specific line using key */}
              <Line
                key={`amplitude_conversions-${selectedMetrics.includes("amplitude_conversions") ? "on" : "off"}`}
                dataKey="amplitude_conversions_n"
                name="amplitude_conversions"
                type="monotone"
                stroke="var(--color-amplitude_conversions)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                hide={!selectedMetrics.includes("amplitude_conversions")}
                isAnimationActive={selectedMetrics.includes("amplitude_conversions")}
                animationDuration={350}
              />
              <Line
                key={`gsc_impressions-${selectedMetrics.includes("gsc_impressions") ? "on" : "off"}`}
                dataKey="gsc_impressions_n"
                name="gsc_impressions"
                type="monotone"
                stroke="var(--color-gsc_impressions)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                hide={!selectedMetrics.includes("gsc_impressions")}
                isAnimationActive={selectedMetrics.includes("gsc_impressions")}
                animationDuration={350}
              />
              <Line
                key={`gsc_ctr-${selectedMetrics.includes("gsc_ctr") ? "on" : "off"}`}
                dataKey="gsc_ctr_n"
                name="gsc_ctr"
                type="monotone"
                stroke="var(--color-gsc_ctr)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                hide={!selectedMetrics.includes("gsc_ctr")}
                isAnimationActive={selectedMetrics.includes("gsc_ctr")}
                animationDuration={350}
              />
              <Line
                key={`gsc_clicks-${selectedMetrics.includes("gsc_clicks") ? "on" : "off"}`}
                dataKey="gsc_clicks_n"
                name="gsc_clicks"
                type="monotone"
                stroke="var(--color-gsc_clicks)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                hide={!selectedMetrics.includes("gsc_clicks")}
                isAnimationActive={selectedMetrics.includes("gsc_clicks")}
                animationDuration={350}
              />
              <Line
                key={`gsc_position-${selectedMetrics.includes("gsc_position") ? "on" : "off"}`}
                dataKey="gsc_position_n"
                name="gsc_position"
                type="monotone"
                stroke="var(--color-gsc_position)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                hide={!selectedMetrics.includes("gsc_position")}
                isAnimationActive={selectedMetrics.includes("gsc_position")}
                animationDuration={350}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
