"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconCalendar, IconRefresh } from "@tabler/icons-react";
import { format, parseISO, startOfWeek } from "date-fns";
import { useRouter } from "next/navigation";
import * as React from "react";

interface SiteHeaderProps {
  availableWeeks?: string[];
  currentWeeks?: string[];
  basePath?: string;
  onNavigationStateChange?: (isPending: boolean) => void;
}

/**
 * Site Header híbrido (2025)
 * - Client Component para interações ricas
 * - Usa navegação otimizada com compressão
 * - URL sync para compartilhamento
 */
export function SiteHeader({
  availableWeeks = [],
  currentWeeks = [],
  basePath = "/",
  onNavigationStateChange,
}: SiteHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [selectedWeeks, setSelectedWeeks] = React.useState<string[]>(currentWeeks);

  React.useEffect(() => {
    onNavigationStateChange?.(isPending);
  }, [isPending, onNavigationStateChange]);

  const formatWeekDisplay = (weekEnding: string) => {
    const date = parseISO(weekEnding);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    return `${format(weekStart, "dd/MM")} - ${format(date, "dd/MM/yyyy")}`;
  };

  const handleWeekToggle = (week: string) => {
    setSelectedWeeks((prev) => {
      const newSelection = prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week];
      return newSelection;
    });
  };

  const handleApplySelection = () => {
    setOpen(false);

    startTransition(() => {
      // Constrói URL com os filtros selecionados
      const params = new URLSearchParams();

      if (selectedWeeks.length > 0) {
        params.set("weeks", selectedWeeks.sort().join(","));
      }

      const url = params.toString() ? `${basePath}?${params}` : basePath;
      router.push(url);
    });
  };

  const handleClear = () => {
    setSelectedWeeks([]);
    setOpen(false);
    startTransition(() => {
      router.push(basePath);
    });
  };

  const displayText =
    selectedWeeks.length === 0
      ? "Selecione as semanas"
      : selectedWeeks.length === 1 && selectedWeeks[0]
        ? `Semana: ${formatWeekDisplay(selectedWeeks[0])}`
        : selectedWeeks.length === availableWeeks.length
          ? "Todas as semanas"
          : `${selectedWeeks.length} semanas selecionadas`;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">Clusters Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-80 justify-start text-left font-normal"
              >
                <IconCalendar className="mr-2 size-4 shrink-0" />
                <span className="truncate">{displayText}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filtrar por Semana</h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedWeeks.length} de {availableWeeks.length} selecionadas
                  </span>
                </div>

                {/* Select All */}
                <div className="flex items-center space-x-2 p-2 mb-2 bg-muted/50 rounded-md hover:bg-muted transition-colors w-full cursor-pointer">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedWeeks.length === availableWeeks.length && availableWeeks.length > 0
                    }
                    onCheckedChange={(checked) => {
                      setSelectedWeeks(checked ? [...availableWeeks] : []);
                    }}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium flex-1 select-none cursor-pointer"
                  >
                    Todas as semanas
                  </label>
                </div>

                <Separator className="mb-2" />

                <ScrollArea className="h-[260px]">
                  <div className="space-y-1">
                    {availableWeeks.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">
                        Nenhuma semana com dados disponível
                      </p>
                    ) : (
                      availableWeeks.map((week) => (
                        <div
                          key={week}
                          className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors w-full cursor-pointer"
                        >
                          <Checkbox
                            id={`week-${week}`}
                            checked={selectedWeeks.includes(week)}
                            onCheckedChange={() => handleWeekToggle(week)}
                          />
                          <label
                            htmlFor={`week-${week}`}
                            className="text-sm font-normal flex-1 select-none cursor-pointer"
                          >
                            {formatWeekDisplay(week)}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Separator className="my-2" />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleApplySelection}
                    disabled={selectedWeeks.length === 0}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              startTransition(() => {
                router.push(basePath);
                router.refresh();
              });
            }}
          >
            <IconRefresh className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
