"use client";

import {
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
  IconExternalLink,
  IconSearch,
} from "@tabler/icons-react";
import type {
  Cell,
  Column,
  ColumnDef,
  HeaderGroup,
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
import { Button } from "@/components/ui/button";
import { Delta } from "@/components/ui/delta";
// removed column toggle UI per request
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ClusterUrlAggregates } from "@/lib/data/metrics-queries";

const columns: ColumnDef<ClusterUrlAggregates>[] = [
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium w-full justify-end text-right"
      >
        <span className="inline-flex items-center gap-1">
          <span>Conversões</span>
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
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.amplitude_conversions_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right font-medium">
            {row.original.amplitude_conversions.toLocaleString("pt-BR")}
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium w-full justify-end text-right"
      >
        <span className="inline-flex items-center gap-1">
          <span>Impressões</span>
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
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.gsc_impressions_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right">{row.original.gsc_impressions.toLocaleString("pt-BR")}</div>
          <Delta value={pct} variant="percent" />
        </div>
      );
    },
  },
  // Cliques
  {
    accessorKey: "gsc_clicks",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium w-full justify-end text-right"
      >
        <span className="inline-flex items-center gap-1">
          <span>Cliques</span>
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
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const pct = row.original.gsc_clicks_delta_pct ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right font-medium">
            {row.original.gsc_clicks.toLocaleString("pt-BR")}
          </div>
          <Delta value={pct} variant="percent" />
        </div>
      );
    },
  },
  // Posição
  {
    accessorKey: "gsc_position",
    header: ({ column }: { column: Column<ClusterUrlAggregates> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium w-full justify-end text-right"
      >
        <span className="inline-flex items-center gap-1">
          <span>Posição</span>
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
    ),
    cell: ({ row }: { row: Row<ClusterUrlAggregates> }) => {
      const delta = row.original.gsc_position_delta ?? 0;
      return (
        <div className="flex flex-col items-end">
          <div className="text-right">{row.original.gsc_position.toFixed(1)}</div>
          <Delta value={delta} variant="absolute" precision={1} positiveIcon="down" />
        </div>
      );
    },
  },
];

export function ClusterUrlsTable({ data = [] as ClusterUrlAggregates[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "amplitude_conversions", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const deferredInput = React.useDeferredValue(inputValue);
  React.useEffect(() => {
    setGlobalFilter(deferredInput);
  }, [deferredInput]);
  const [columnVisibility] = React.useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
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

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Páginas do Cluster</h2>
        <div className="flex items-center gap-2 ml-auto">
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

      <div
        ref={useVirtual ? containerRef : undefined}
        className={`rounded-lg border ${useVirtual ? "max-h-[640px] overflow-auto" : "overflow-hidden"}`}
      >
        <Table className="table-fixed w-full">
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<ClusterUrlAggregates>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(
                  (header: HeaderGroup<ClusterUrlAggregates>["headers"][0]) => {
                    const id = header.column.id as string;
                    // Larguras fixas: name=40%, conversões/impressões/cliques=15% cada, posição=15%
                    const cls =
                      id === "amplitude_conversions"
                        ? "text-right w-[15%] px-4"
                        : id === "gsc_impressions"
                          ? "text-right w-[15%] px-4"
                          : id === "gsc_clicks"
                            ? "text-right w-[15%] px-4"
                            : id === "gsc_position"
                              ? "text-right w-[15%] px-4"
                              : id === "name"
                                ? "text-left w-[40%] px-4"
                                : "text-left";
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
          </TableHeader>
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
                        {row.getVisibleCells().map((cell: Cell<ClusterUrlAggregates, unknown>) => {
                          const id = cell.column.id as string;
                          const cls =
                            id === "amplitude_conversions"
                              ? "text-right w-[15%] px-4"
                              : id === "gsc_impressions"
                                ? "text-right w-[15%] px-4"
                                : id === "gsc_clicks"
                                  ? "text-right w-[15%] px-4"
                                  : id === "gsc_position"
                                    ? "text-right w-[15%] px-4"
                                    : id === "name"
                                      ? "text-left w-[40%] px-4"
                                      : "text-left";
                          return (
                            <TableCell key={cell.id} className={cls}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell: Cell<ClusterUrlAggregates, unknown>) => {
                      const id = cell.column.id as string;
                      const cls =
                        id === "amplitude_conversions"
                          ? "text-right w-[15%] px-4"
                          : id === "gsc_impressions"
                            ? "text-right w-[15%] px-4"
                            : id === "gsc_clicks"
                              ? "text-right w-[15%] px-4"
                              : id === "gsc_position"
                                ? "text-right w-[15%] px-4"
                                : id === "name"
                                  ? "text-left w-[40%] px-4"
                                  : "text-left";
                      return (
                        <TableCell key={cell.id} className={cls}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
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
        </Table>
      </div>
    </div>
  );
}
