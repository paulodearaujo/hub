import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARDS = 5;
const SKELETON_TABLE_ROWS = 10;

const SKELETON_CARD_IDS = Array.from({ length: SKELETON_CARDS }, (_, i) => `skel-card-${i}`);
const SKELETON_ROW_IDS = Array.from({ length: SKELETON_TABLE_ROWS }, (_, i) => `skel-row-${i}`);

export default function ClusterLoading() {
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
        {/* Site Header */}
        <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <Skeleton className="h-6 w-6" />
            <div className="h-4 w-px bg-border mx-2" />
            <Skeleton className="h-5 w-48" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-9 w-[320px]" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Cluster header */}
              <div className="flex flex-col gap-3 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex flex-col min-w-0">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>

              {/* Section cards */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-5">
                {SKELETON_CARD_IDS.map((id, index) => (
                  <Card key={id} className="@container/card">
                    <CardHeader>
                      {/* Icon + Label + Delta on same line */}
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-3.5 w-3.5 rounded" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                      {/* Main value */}
                      <div>
                        <Skeleton
                          className={`h-8 mt-1.5 @[250px]/card:h-9 ${
                            index === 1
                              ? "w-[90%]"
                              : // Impressões - maior
                                index === 2
                                ? "w-14"
                                : // CTR - menor
                                  index === 4
                                  ? "w-12"
                                  : // Posição - menor
                                    "w-20" // Conversões, Cliques - médio
                          }`}
                        />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Chart */}
              <div className="px-4 lg:px-6">
                <Card className="@container/card">
                  <CardHeader className="@container/card-header grid auto-rows-min grid-cols-[1fr_auto] items-start gap-1.5">
                    <div className="col-start-1 row-start-1 space-y-1.5">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                    {/* Toggle */}
                    <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                      <div className="flex gap-0 h-9 rounded-md shadow-xs">
                        <Skeleton className="h-9 w-[98px] rounded-r-none" />
                        <Skeleton className="h-9 w-[98px] rounded-none border-x" />
                        <Skeleton className="h-9 w-[98px] rounded-none border-r" />
                        <Skeleton className="h-9 w-[98px] rounded-none border-r" />
                        <Skeleton className="h-9 w-[97px] rounded-l-none" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <Skeleton className="aspect-auto h-[220px] sm:h-[250px] w-full rounded-lg" />
                  </CardContent>
                </Card>
              </div>

              {/* URLs Table */}
              <div className="px-4 lg:px-6">
                {/* Header com busca APENAS - SEM botões de ação! */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-lg font-semibold">
                    <Skeleton className="h-6 w-32 inline-block" />
                  </h2>
                  <div className="flex items-center gap-2 ml-auto">
                    {/* Input de busca */}
                    <div className="relative w-full sm:w-64">
                      <Skeleton className="h-9 w-full sm:w-64" />
                    </div>
                    {/* Switch de ordenação */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-11 rounded-full" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Tabela */}
                <div className="rounded-lg border">
                  <div className="max-h-[640px] overflow-hidden">
                    <table className="w-full table-fixed caption-bottom text-sm">
                      <thead className="[&_tr]:border-b bg-muted border-b shadow-sm sticky top-0 z-10">
                        <tr>
                          <th className="h-10 w-[44px] px-4">
                            <Skeleton className="h-4 w-4" />
                          </th>
                          <th className="h-10 text-left w-[35%] px-4">
                            <Skeleton className="h-4 w-16" />
                          </th>
                          <th className="h-10 text-right w-[13%] px-4">
                            <Skeleton className="h-4 w-20 ml-auto" />
                          </th>
                          <th className="h-10 text-right w-[13%] px-4">
                            <Skeleton className="h-4 w-20 ml-auto" />
                          </th>
                          <th className="h-10 text-right w-[13%] px-4">
                            <Skeleton className="h-4 w-12 ml-auto" />
                          </th>
                          <th className="h-10 text-right w-[13%] px-4">
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </th>
                          <th className="h-10 text-right w-[13%] px-4">
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKELETON_ROW_IDS.map((id) => (
                          <tr key={id} className="border-b">
                            <td className="py-4 px-4 align-middle">
                              <Skeleton className="h-4 w-4" />
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex items-center gap-2 min-w-0">
                                <Skeleton className="h-4 w-3/4 flex-1" />
                                <Skeleton className="h-3.5 w-3.5 shrink-0" />
                              </div>
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-14" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            </td>
                            <td className="py-4 px-4 align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <Skeleton className="h-4 w-8" />
                                <Skeleton className="h-3 w-10" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
