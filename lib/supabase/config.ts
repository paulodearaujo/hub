/**
 * Centralized Supabase environment resolver.
 *
 * Rules:
 * - Never expose service-role keys to the client. We only use anon/publishable keys.
 * - Allow switching between production and staging using SUPABASE_ENVIRONMENT.
 * - Prefer the existing NEXT_PUBLIC_* vars as the single source of truth for production,
 *   and add optional STAGING variants.
 * - When SUPABASE_ENVIRONMENT=staging, resolve to STAGING vars if present;
 *   otherwise fall back to production to avoid breakage.
 */

export type SupabaseResolvedEnv = {
  url: string | undefined;
  anonKey: string | undefined;
};

/**
 * Resolve environment-aware Supabase URL and anon key.
 * This function is safe to use in server and edge contexts.
 */
export function resolveSupabaseEnv(): SupabaseResolvedEnv {
  const environment = (process.env.SUPABASE_ENVIRONMENT || "production").toLowerCase();

  // Prefer public/publishable keys only. Never read SUPABASE_KEY_* service-role here.
  const prodUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prodAnon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  const stagingUrl =
    process.env.SUPABASE_URL_STAGING || process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
  const stagingAnon =
    process.env.SUPABASE_KEY_STAGING ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY_STAGING;

  if (environment === "staging") {
    return {
      url: stagingUrl || prodUrl,
      anonKey: stagingAnon || prodAnon,
    };
  }

  return { url: prodUrl, anonKey: prodAnon };
}

/**
 * Strict variant that throws when required env vars are missing.
 */
export function getRequiredSupabaseEnv(): { url: string; anonKey: string } {
  const { url, anonKey } = resolveSupabaseEnv();
  if (!url || !anonKey) {
    throw new Error("Missing Supabase public env vars (url or anonKey)");
  }
  // At this point, both are defined; narrow to string.
  return { url: url as string, anonKey: anonKey as string };
}
