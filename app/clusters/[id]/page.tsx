import { SectionCards } from "@/app/components/section-cards";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WeeklyMetricsChart } from "@/components/weekly-metrics-chart";
import {
  getAvailableWeeks,
  getClusterInfo,
  getClusterUrlsMetrics,
  getClusterWeeklyMetrics,
  getLatestRunId,
  getRunMetadata,
} from "@/lib/data/metrics-queries";
import { calculateMetricsWithDeltas } from "@/lib/delta-calculations";
import type { Metadata, ResolvingMetadata } from "next";
import dynamic from "next/dynamic";

import { ClusterHeader } from "../components/cluster-header";
import { ClusterWrapper } from "./cluster-wrapper";

// Chart is a Client Component; static import avoids `ssr:false` restriction in Server Components.

const ClusterUrlsTable = dynamic(() =>
  import("../components/cluster-urls-table").then((m) => ({ default: m.ClusterUrlsTable })),
);

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ weeks?: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const title = `Cluster ${id}`;
  return {
    title,
    description: `Detalhes e métricas do cluster ${id}.`,
    alternates: { canonical: `/clusters/${id}` },
    openGraph: { url: `/clusters/${id}`, title },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { weeks } = await searchParams;

  const runId = await getLatestRunId();
  if (!runId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Nenhum run de clustering encontrado.</p>
      </div>
    );
  }

  const runMetadata = await getRunMetadata(runId);
  const formattedClusterDate = runMetadata?.createdAt
    ? new Date(runMetadata.createdAt).toISOString()
    : null;

  const availableWeeks = await getAvailableWeeks();
  const selectedWeeks = weeks
    ? weeks.split(",").filter((w) => w && availableWeeks.includes(w))
    : (availableWeeks as string[]);

  const clusterId = Number.parseInt(id, 10);
  const [info] = await Promise.all([getClusterInfo(runId, clusterId)]);

  // Aggregate totals for KPIs will stream below

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
        <ClusterWrapper
          availableWeeks={availableWeeks as string[]}
          currentWeeks={selectedWeeks}
          clusterId={id}
        >
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <ClusterHeader
                name={info?.cluster_name || `Cluster ${id}`}
                meta={{
                  id: clusterId,
                  size: info?.cluster_size || 0,
                  coherence:
                    info && info.cluster_coherence !== null && info.cluster_coherence !== undefined
                      ? info.cluster_coherence
                      : undefined,
                  density:
                    info && info.cluster_density !== null && info.cluster_density !== undefined
                      ? info.cluster_density
                      : undefined,
                  avgSimilarity:
                    info && info.avg_similarity !== null && info.avg_similarity !== undefined
                      ? info.avg_similarity
                      : undefined,
                  minSimilarity:
                    info && info.min_similarity !== null && info.min_similarity !== undefined
                      ? info.min_similarity
                      : undefined,
                  runDate: formattedClusterDate || undefined,
                }}
                backHref={`/${selectedWeeks.length ? `?weeks=${selectedWeeks.join(",")}` : ""}`}
              />
              <CardsSection clusterId={clusterId} selectedWeeks={selectedWeeks} />
              <ChartAndUrls
                clusterId={clusterId}
                selectedWeeks={selectedWeeks}
                clusterName={info?.cluster_name || `Cluster ${id}`}
                clusterMeta={{
                  id: clusterId,
                  size: info?.cluster_size || 0,
                  coherence:
                    info && info.cluster_coherence !== null && info.cluster_coherence !== undefined
                      ? info.cluster_coherence
                      : undefined,
                  density:
                    info && info.cluster_density !== null && info.cluster_density !== undefined
                      ? info.cluster_density
                      : undefined,
                  avgSimilarity:
                    info && info.avg_similarity !== null && info.avg_similarity !== undefined
                      ? info.avg_similarity
                      : undefined,
                  minSimilarity:
                    info && info.min_similarity !== null && info.min_similarity !== undefined
                      ? info.min_similarity
                      : undefined,
                }}
              />
            </div>
          </div>
        </ClusterWrapper>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function CardsSection({
  clusterId,
  selectedWeeks,
}: {
  clusterId: number;
  selectedWeeks: string[];
}) {
  const runId = await getLatestRunId();
  if (!runId) return null;

  // Base period totals
  const weeklyBase = await getClusterWeeklyMetrics(runId, clusterId, selectedWeeks);

  // Build delta period: if only 1 week selected, include the immediately previous available week
  let deltaWeeks: string[] = selectedWeeks;
  if (selectedWeeks.length === 1) {
    const all = await getAvailableWeeks();
    const idx = all.indexOf(selectedWeeks[0] as string);
    if (idx >= 0 && idx + 1 < all.length) {
      deltaWeeks = Array.from(
        new Set([all[idx + 1] as string, selectedWeeks[0] as string]),
      ) as string[];
    }
  }
  const weeklyForDelta = await getClusterWeeklyMetrics(runId, clusterId, deltaWeeks);

  // Use centralized function for consistent delta calculation
  const metricsData = calculateMetricsWithDeltas(weeklyBase, weeklyForDelta);

  return <SectionCards metrics={metricsData} />;
}

async function ChartAndUrls({
  clusterId,
  selectedWeeks,
  clusterName,
  clusterMeta,
}: {
  clusterId: number;
  selectedWeeks: string[];
  clusterName: string;
  clusterMeta: {
    id: number;
    size: number;
    coherence?: number | undefined;
    density?: number | undefined;
    avgSimilarity?: number | undefined;
    minSimilarity?: number | undefined;
  };
}) {
  const runId = await getLatestRunId();
  if (!runId) return null;
  const [weekly, urls] = await Promise.all([
    // Chart: include previous week when only one is selected (for WoW visualization)
    (async () => {
      let weeks = selectedWeeks;
      if (selectedWeeks.length === 1) {
        const all = await getAvailableWeeks();
        const idx = all.indexOf(selectedWeeks[0] as string);
        if (idx >= 0 && idx + 1 < all.length) {
          weeks = Array.from(
            new Set([all[idx + 1] as string, selectedWeeks[0] as string]),
          ) as string[];
        }
      }
      return getClusterWeeklyMetrics(runId, clusterId, weeks);
    })(),
    getClusterUrlsMetrics(runId, clusterId, selectedWeeks, 200, 0),
  ]);

  return (
    <>
      <div className="px-4 lg:px-6">
        <WeeklyMetricsChart data={weekly} selectedWeeks={selectedWeeks} />
      </div>
      <ClusterUrlsTable
        data={urls}
        clusterName={clusterName}
        selectedWeeks={selectedWeeks}
        clusterMeta={clusterMeta}
      />
    </>
  );
}
