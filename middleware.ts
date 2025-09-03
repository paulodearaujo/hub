import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Restrict to health check only to avoid global dynamic behavior
  matcher: ["/api/health/:path*"],
};
