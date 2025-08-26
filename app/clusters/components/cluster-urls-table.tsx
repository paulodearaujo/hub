"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateCtrPointsChange, calculatePreviousCtr, Delta } from "@/components/ui/delta";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ClusterUrlAggregates } from "@/lib/data/metrics-queries";
import { formatCtr, formatNumber, formatPosition } from "@/lib/formatters";
import {
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
  IconDownload,
  IconExternalLink,
  IconPencil,
  IconSearch,
} from "@tabler/icons-react";
import type {
  Cell,
  Column,
  ColumnDef,
  HeaderGroup,
  Table as ReactTableType,
  Row,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

// Helper: width/alignment classes per column id (simpler & DRY)
const COLUMN_CLASS: Record<string, string> = {
  select: "text-left w-[44px] px-4",
  name: "text-left w-[35%] px-4",
  amplitude_conversions: "text-right w-[13%] px-4",
  gsc_impressions: "text-right w-[13%] px-4",
  gsc_ctr: "text-right w-[13%] px-4",
  gsc_clicks: "text-right w-[13%] px-4",
  gsc_position: "text-right w-[13%] px-4",
};
function getColumnClass(id: string): string {
  return COLUMN_CLASS[id] ?? "text-left";
}

// Helper: sortable header button with arrows
function SortableHeader({
  column,
  label,
}: {
  column: Column<ClusterUrlAggregates>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-medium w-full justify-end text-right"
    >
      <span className="inline-flex items-center gap-1">
        <span>{label}</span>
        <span className="inline-flex w-4 justify-center">
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="size-3" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="size-3" />
          ) : (
            <IconArrowsUpDown className="size-3 opacity-50" />
          )}
        </span>
      </span>
    </Button>
  );
}

// Helper: render cells for a row consistently (used by virtual and non-virtual paths)
function renderCells(row: Row<ClusterUrlAggregates>) {
  return row.getVisibleCells().map((cell: Cell<ClusterUrlAggregates, unknown>) => {
    const id = cell.column.id as string;
    const cls = getColumnClass(id);
    return (
      <TableCell key={cell.id} className={cls}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    );
  });
}

// Small utilities reused across actions
function escapeCSV(value: string): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
function sanitizeForFilename(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const columns: ColumnDef<ClusterUrlAggregates>[] = [
  {
    id: "select",
    header: ({ table }: { table: ReactTableType<ClusterUrlAggregates> }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-checked={table.getIsSomeRowsSelected() ? "mixed" : table.getIsAllRowsSelected()}
        aria-label="Selecionar todas as linhas"
      />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Página",
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const url = row.original.url;
      const title = row.original.name || url;
      const tooltip =
        title === url ? (
          url
        ) : (
          <div className="max-w-[80vw]">
            <div className="font-medium mb-1 break-words">{title}</div>
            <div className="opacity-80 break-all text-xs">{url}</div>
          </div>
        );
      return (
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline truncate block"
                title={undefined}
              >
                {title}
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-[80vw]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
          <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
        </div>
      );
    },
  },
  // Conversões
  {
    accessorKey: "amplitude_conversions",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <SortableHeader column={column} label="Conversões" />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.amplitude_conversions_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right font-medium">
            {formatNumber(row.original.amplitude_conversions)}
          </div>
          <Delta value={pct} variant="percent" />
        </div>
      );
    },
  },
  // Impressões
  {
    accessorKey: "gsc_impressions",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <SortableHeader column={column} label="Impressões" />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.gsc_impressions_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right">{formatNumber(row.original.gsc_impressions)}</div>
          <Delta value={pct} variant="percent" />
        </div>
      );
    },
  },
  // CTR
  {
    accessorKey: "gsc_ctr",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <SortableHeader column={column} label="CTR" />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const ctr = row.original.gsc_ctr ?? 0;
      // Use centralized functions for calculations
      const prevCtr = calculatePreviousCtr(
        row.original.gsc_impressions,
        row.original.gsc_clicks,
        row.original.gsc_impressions_delta_pct,
        row.original.gsc_clicks_delta_pct,
      );
      const ctrDeltaPP = calculateCtrPointsChange(ctr, prevCtr);
      return (
        <div className="flex flex-col items-end">
          <div className="text-right font-medium">{formatCtr(ctr)}</div>
          <Delta value={ctrDeltaPP} variant="absolute" precision={1} suffix="p.p." />
        </div>
      );
    },
  },
  // Cliques
  {
    accessorKey: "gsc_clicks",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <SortableHeader column={column} label="Cliques" />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.gsc_clicks_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right font-medium">{formatNumber(row.original.gsc_clicks)}</div>
          <Delta value={pct} variant="percent" />
        </div>
      );
    },
  },
  // Posição
  {
    accessorKey: "gsc_position",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <SortableHeader column={column} label="Posição" />
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const delta = row.original.gsc_position_delta ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right">{formatPosition(row.original.gsc_position)}</div>
          <Delta value={delta} variant="absolute" precision={1} positiveIcon="down" />
        </div>
      );
    },
  },
];

export function ClusterUrlsTable({
  data = [] as ClusterUrlAggregates[],
  clusterName,
  selectedWeeks,
}: {
  data?: ClusterUrlAggregates[];
  clusterName?: string;
  selectedWeeks?: string[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "amplitude_conversions", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const deferredInput = React.useDeferredValue(inputValue);
  React.useEffect(() => {
    setGlobalFilter(deferredInput);
  }, [deferredInput]);
  const [columnVisibility] = React.useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.url,
    // no column toggle controls
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Virtualization when many rows
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;
  const useVirtual = rows.length > 100;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });
  const selectedCount = table.getSelectedRowModel().rows.length;
  const plural = selectedCount > 1 ? "s" : "";

  const exportSelectedToCSV = React.useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows as Row<ClusterUrlAggregates>[];
    if (!selectedRows || selectedRows.length === 0) return;
    const header = ["Título", "URL", "Conversões", "Impressões", "CTR", "Cliques", "Posição"];
    const records = selectedRows.map((r) => {
      const o = r.original;
      const title = (o.name || o.url) as string;
      const url = o.url as string;
      const conversions = o.amplitude_conversions ?? 0;
      const impressions = o.gsc_impressions ?? 0;
      const ctr = formatCtr(o.gsc_ctr);
      const clicks = o.gsc_clicks ?? 0;
      const position = formatPosition(o.gsc_position);
      return [
        title,
        url,
        String(conversions),
        String(impressions),
        `${ctr}%`,
        String(clicks),
        position,
      ];
    });
    const lines = [header, ...records].map((cols) => cols.map(escapeCSV).join(","));
    const csv = `\uFEFF${lines.join("\r\n")}`; // BOM for Excel compatibility
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    // Compute date range from selected weeks if provided
    const weeksSorted =
      selectedWeeks && selectedWeeks.length > 0
        ? [...selectedWeeks].sort((a, b) => a.localeCompare(b))
        : [];
    const start = weeksSorted[0];
    const end = weeksSorted[weeksSorted.length - 1] || start;
    const slug = clusterName ? sanitizeForFilename(clusterName) : "cluster";
    a.href = url;
    a.download = start && end ? `cluster-${slug}-${start}--${end}.csv` : `cluster-${slug}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [table, clusterName, selectedWeeks]);

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Páginas do Cluster</h2>
        <div className="flex items-center gap-2 ml-auto">
          {selectedCount > 0 ? (
            <Drawer>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DrawerTrigger asChild>
                    <Button type="button" className="bg-black text-white hover:bg-black/90">
                      <IconPencil className="size-4" />
                      Revisar conteúdo
                    </Button>
                  </DrawerTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Enviar os textos selecionados para revisão
                </TooltipContent>
              </Tooltip>
              <DrawerContent>
                <div className="mx-auto w-full max-w-xl px-6 py-6">
                  <DrawerHeader className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-5">
                      <Avatar className="size-14 ring-2 ring-black/10 shadow-sm">
                        <AvatarImage src="/everaldo.png" alt="Foto de Everaldo" />
                        <AvatarFallback>EV</AvatarFallback>
                      </Avatar>
                      <div className="text-center min-w-0">
                        <DrawerTitle asChild>
                          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-balance">
                            Enviar para revisão
                          </h2>
                        </DrawerTitle>
                        <DrawerDescription asChild>
                          <p className="text-muted-foreground text-xl leading-7">
                            Você vai enviar <span className="font-medium">{selectedCount}</span>{" "}
                            texto{plural} para o Everaldo revisar.
                          </p>
                        </DrawerDescription>
                      </div>
                    </div>
                  </DrawerHeader>
                  <Separator className="my-4" />
                  <div className="text-sm text-muted-foreground mb-2 text-center">
                    Confirme para prosseguir ou cancele para ajustar a seleção.
                  </div>
                  <DrawerFooter className="pt-2 grid gap-3 sm:grid-cols-2">
                    <DrawerClose asChild>
                      <Button size="lg" className="w-full bg-black text-white hover:bg-black/90">
                        Confirmar envio
                      </Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button size="lg" variant="outline" className="w-full">
                        Cancelar
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          ) : null}
          {selectedCount > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportSelectedToCSV}
                  className="gap-2"
                >
                  <IconDownload className="size-4" />
                  Exportar CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Exportar itens selecionados em CSV</TooltipContent>
            </Tooltip>
          ) : null}
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou URL..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div
          ref={useVirtual ? containerRef : undefined}
          className="max-h-[640px] overflow-auto relative"
        >
          <table className="w-full table-fixed caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted border-b shadow-sm sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<ClusterUrlAggregates>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: HeaderGroup<ClusterUrlAggregates>["headers"][0]) => {
                      const id = header.column.id as string;
                      const cls = getColumnClass(id);
                      return (
                        <TableHead key={header.id} className={cls}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    },
                  )}
                </TableRow>
              ))}
            </thead>
            <TableBody>
              {rows.length ? (
                useVirtual ? (
                  // Virtualização: padding superior, linhas visíveis, padding inferior
                  <>
                    {/* Padding top */}
                    {(() => {
                      const firstItem = rowVirtualizer.getVirtualItems()[0];
                      return firstItem && firstItem.start > 0 ? (
                        <tr>
                          <td colSpan={columns.length} style={{ height: firstItem.start }} />
                        </tr>
                      ) : null;
                    })()}
                    {/* Linhas visíveis */}
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index] as Row<ClusterUrlAggregates>;
                      return (
                        <TableRow key={row.id} data-index={virtualRow.index}>
                          {renderCells(row)}
                        </TableRow>
                      );
                    })}
                    {/* Padding bottom */}
                    {(() => {
                      const lastItem = rowVirtualizer.getVirtualItems().at(-1);
                      const remainingHeight = lastItem
                        ? rowVirtualizer.getTotalSize() - lastItem.end
                        : 0;
                      return remainingHeight > 0 ? (
                        <tr>
                          <td colSpan={columns.length} style={{ height: remainingHeight }} />
                        </tr>
                      ) : null;
                    })()}
                  </>
                ) : (
                  rows.map((row: Row<ClusterUrlAggregates>) => (
                    <TableRow key={row.id}>{renderCells(row)}</TableRow>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma página encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  );
}
