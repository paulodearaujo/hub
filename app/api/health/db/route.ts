import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Health check endpoint com verificação do banco de dados
// Use /api/health/db para verificar também a conectividade com o Supabase
export async function GET() {
  const startTime = Date.now();

  try {
    // Teste de conexão com o banco
    const supabase = await createClient();

    // Query simples e rápida apenas para verificar conectividade
    const { error } = await supabase
      .from("blog_articles_metrics")
      .select("week_ending")
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    // Se houver erro mas não for "no rows", o banco está inacessível
    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          service: "dashboard-inbound",
          database: "unreachable",
          error: error.message,
          responseTime: `${responseTime}ms`,
        },
        { status: 503 }, // Service Unavailable
      );
    }

    // Tudo OK
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "dashboard-inbound",
        database: "connected",
        responseTime: `${responseTime}ms`,
      },
      { status: 200 },
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "dashboard-inbound",
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 503 },
    );
  }
}
