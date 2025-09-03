import { NextResponse } from "next/server";

// Health check endpoint otimizado para o Render
export async function GET() {
  try {
    // Resposta básica rápida - sem queries ao banco
    // O Render só precisa saber se o servidor está respondendo
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "dashboard-inbound",
      },
      { status: 200 },
    );
  } catch {
    // Em caso de erro inesperado
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }, // Service Unavailable
    );
  }
}

// Permitir HEAD requests para health checks ainda mais rápidos
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
