"use client";

import type { Tables } from "@/lib/database.types";
import dynamic from "next/dynamic";

type WeeklyMetric = Partial<Tables<"blog_articles_metrics">>;

export interface WeeklyMetricsChartClientProps {
  data?: WeeklyMetric[];
  selectedWeeks?: string[];
}

const Inner = dynamic(
  () =>
    import("@/components/weekly-metrics-chart").then((m) => ({
      default: m.WeeklyMetricsChart,
    })),
  {
    ssr: false,
  },
);

export default function WeeklyMetricsChartClient(props: WeeklyMetricsChartClientProps) {
  return <Inner {...props} />;
}
