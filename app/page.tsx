import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { SectionCards } from "@/app/components/section-cards";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getAvailableWeeks,
  getClusterLeaderboard,
  getLatestRunId,
  getRunMetadata,
  getWeeklyMetrics,
} from "@/lib/data/metrics-queries";
import type { Tables } from "@/lib/database.types";
import { calculateMetricsWithDeltas } from "@/lib/delta-calculations";

import { DashboardWrapper } from "./dashboard-wrapper";

export const metadata: Metadata = {
  title: "Dashboard SEO Clustering",
  description: "Análise de performance e agrupamento de conteúdo do blog.",
  alternates: { canonical: "/" },
};

const WeeklyMetricsChart = dynamic(() =>
  import("@/components/weekly-metrics-chart.client").then((m) => ({ default: m.default })),
);

const ClusterLeaderboardTable = dynamic(() =>
  import("./components/cluster-leaderboard-table").then((m) => ({
    default: m.ClusterLeaderboardTable,
  })),
);

interface PageProps {
  searchParams: Promise<{ weeks?: string; week?: string }>;
}

// Usando tipo do banco de dados
type WeeklyMetric = Partial<Tables<"blog_articles_metrics">>;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  // Get latest run
  const runId = await getLatestRunId();

  if (!runId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Nenhum run de clustering encontrado.</p>
      </div>
    );
  }

  // Get run metadata
  const runMetadata = await getRunMetadata(runId);

  // Format date on server to avoid hydration mismatch
  const formattedClusterDate = runMetadata?.createdAt
    ? new Date(runMetadata.createdAt).toISOString()
    : null;

  // Get available weeks
  const availableWeeks = await getAvailableWeeks();

  // Determine the selected weeks (from query param or ALL weeks by default)
  let selectedWeeks: string[] = [];

  if (params.weeks) {
    // Parse weeks from comma-separated string
    const parsedWeeks = params.weeks.split(",").filter(Boolean);
    selectedWeeks = parsedWeeks.filter((w) => availableWeeks.includes(w));
  } else if (params.week) {
    // Backwards compatibility with single week param
    selectedWeeks = [params.week].filter((w) => availableWeeks.includes(w));
  } else {
    // Default to ALL weeks if no param specified
    selectedWeeks = availableWeeks as string[];
  }
  // Weeks already selected and validated above; no explicit min/max needed

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <DashboardWrapper availableWeeks={availableWeeks as string[]} currentWeeks={selectedWeeks}>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Cards - responsabilidade: métricas agregadas */}
              <CardsSection selectedWeeks={selectedWeeks} />

              {/* Gráfico e Tabela - responsabilidade: visualizações detalhadas */}
              <ChartAndTable
                runId={runId}
                selectedWeeks={selectedWeeks}
                clusterCreatedAt={formattedClusterDate}
              />
            </div>
          </div>
        </DashboardWrapper>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function CardsSection({ selectedWeeks }: { selectedWeeks: string[] }) {
  // Base period metrics (exactly the selected weeks)
  const weeklyBase = await getWeeklyMetrics(selectedWeeks);

  // Build delta period: if only 1 week selected, include the immediately previous available week
  let deltaWeeks: string[] = selectedWeeks;
  if (selectedWeeks.length === 1) {
    const all = await getAvailableWeeks(); // cached
    const current = selectedWeeks[0] as string;
    const idx = all.indexOf(current);
    if (idx >= 0 && idx + 1 < all.length) {
      deltaWeeks = Array.from(new Set([all[idx + 1] as string, current])) as string[];
    }
  }
  const weeklyForDelta = await getWeeklyMetrics(deltaWeeks);

  // Use centralized function for consistent delta calculation
  const metricsData = calculateMetricsWithDeltas(
    weeklyBase as WeeklyMetric[],
    weeklyForDelta as WeeklyMetric[],
  );

  return <SectionCards metrics={metricsData} />;
}

async function ChartAndTable({
  runId,
  selectedWeeks,
  clusterCreatedAt,
}: {
  runId: string;
  selectedWeeks: string[];
  clusterCreatedAt: string | null;
}) {
  const [weeklyMetrics, clusterLeaderboard] = await Promise.all([
    // Chart: include previous week when only one is selected for WoW
    (async () => {
      let weeks = selectedWeeks;
      if (selectedWeeks.length === 1) {
        const all = await getAvailableWeeks();
        const current = selectedWeeks[0] as string;
        const idx = all.indexOf(current);
        if (idx >= 0 && idx + 1 < all.length) {
          weeks = Array.from(new Set([all[idx + 1] as string, current])) as string[];
        }
      }
      return getWeeklyMetrics(weeks);
    })(),
    getClusterLeaderboard(runId, selectedWeeks),
  ]);

  return (
    <>
      <div className="px-4 lg:px-6">
        <WeeklyMetricsChart data={weeklyMetrics} selectedWeeks={selectedWeeks} />
      </div>
      <ClusterLeaderboardTable
        data={clusterLeaderboard}
        clusterCreatedAt={clusterCreatedAt}
        selectedWeeks={selectedWeeks}
      />
    </>
  );
}
