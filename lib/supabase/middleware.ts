import type { Database } from "@/lib/database.types";
import { createServerClient } from "@supabase/ssr";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check if we have the required environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!url || !anon) {
    // If no Supabase config, just pass through
    return supabaseResponse;
  }

  try {
    // Create Supabase client for middleware
    const supabase = createServerClient<Database>(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<
            { name: string; value: string; options?: Partial<ResponseCookie> }
          >,
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              supabaseResponse.cookies.set(name, value, options);
            } else {
              supabaseResponse.cookies.set(name, value);
            }
          });
        },
      },
    });

    // Refresh session if it exists
    // This will refresh the user's session if it's expired
    await supabase.auth.getUser();

    // No need to do anything else for now
    // The app is public and doesn't require authentication
  } catch (error) {
    // If there's an error, log it but don't block the request
    console.error("Middleware auth error:", error);
  }

  return supabaseResponse;
}
