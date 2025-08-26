"use server";

import { getAvailableWeeks } from "@/lib/data/metrics-queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action para aplicar filtros de semanas
 * Mantém a URL sync para compartilhamento
 */
export async function applyWeekFilter(formData: FormData) {
  const weeks = formData.getAll("weeks") as string[];
  const currentPath = (formData.get("path") as string) || "/";

  // Validação no servidor contra semanas disponíveis
  const availableWeeks = await getAvailableWeeks();
  const validWeeks = weeks.filter((w) => availableWeeks.includes(w));

  // Constrói URL com filtros
  const params = new URLSearchParams();
  if (validWeeks.length > 0) {
    params.set("weeks", validWeeks.sort().join(","));
  }

  const url = params.toString() ? `${currentPath}?${params}` : currentPath;

  // Revalida e redireciona
  revalidatePath(currentPath);
  redirect(url);
}

/**
 * Server Action para limpar filtros
 */
export async function clearWeekFilter(currentPath: string = "/") {
  revalidatePath(currentPath);
  redirect(currentPath);
}
