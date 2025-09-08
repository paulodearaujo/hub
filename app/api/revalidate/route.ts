import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const COOLDOWN_SECONDS = 4; // basic spam protection

export async function POST(req: NextRequest) {
  try {
    // Same-origin guard (basic CSRF/spam mitigation)
    const origin = req.headers.get("origin");
    const url = new URL(req.url);
    if (origin && origin !== url.origin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    // Cooldown cookie: block rapid revalidate spamming from same client
    const store = await cookies();
    const last = store.get("metrics_rv");
    if (last) {
      return NextResponse.json({ ok: false, error: "cooldown" }, { status: 429 });
    }

    // Invalidate data caches tagged as "metrics"
    // Available in Next 15+: revalidateTag
    // Prefer dynamic import to avoid type drift across channels
    const mod = await import("next/cache");
    if (typeof mod.revalidateTag === "function") {
      await mod.revalidateTag("metrics");
    }
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set("metrics_rv", "1", {
      httpOnly: true,
      sameSite: "lax",
      // In dev (http://localhost) secure cookies não são gravadas; em prod mantemos secure=true
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOLDOWN_SECONDS,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
