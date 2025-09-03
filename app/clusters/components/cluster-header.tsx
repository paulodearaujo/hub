"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatQualityPercent } from "@/lib/formatters";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ClusterHeader({
  name,
  meta,
  backHref = "/",
}: {
  name: string;
  meta: {
    id: number;
    size: number;
    coherence?: number | undefined;
    density?: number | undefined;
    avgSimilarity?: number | undefined;
    minSimilarity?: number | undefined;
    runDate?: string | undefined;
  };
  backHref?: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={backHref}
          prefetch
          aria-label="Voltar"
          className="text-muted-foreground hover:text-foreground"
          onMouseEnter={() => {
            try {
              router.prefetch(backHref);
            } catch {}
          }}
        >
          <IconArrowLeft className="size-4" />
        </Link>
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg font-semibold leading-tight truncate">{name}</h2>
          <div className="text-xs text-muted-foreground">Cluster #{meta.id}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">Tamanho {meta.size}</Badge>
          </TooltipTrigger>
          <TooltipContent>Quantidade de páginas no cluster.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">
              Coerência{" "}
              {meta.coherence === undefined ? "—" : formatQualityPercent(meta.coherence, 2)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Força média de similaridade interna do cluster (0-1).</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">
              Densidade {meta.density === undefined ? "—" : formatQualityPercent(meta.density, 2)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Quão conectados estão os itens entre si (0-1).</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">
              Sim. Média{" "}
              {meta.avgSimilarity === undefined ? "—" : formatQualityPercent(meta.avgSimilarity, 2)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Similaridade média entre os pares do cluster (0-1).</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">
              Sim. Mín.{" "}
              {meta.minSimilarity === undefined ? "—" : formatQualityPercent(meta.minSimilarity, 2)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Menor similaridade observada no cluster (0-1).</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
