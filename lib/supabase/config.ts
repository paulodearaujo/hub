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
    // Only accept publishable/anon staging keys. Ignore any private non-public envs here.
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

/**
 * Lightweight fetch wrapper with limited retries for transient upstream errors.
 * Retries only on 520/502/503/504 or network failures, with small backoff.
 */
export function getFetchWithRetry(maxRetries = 2) {
  const transientStatus = new Set([520, 502, 503, 504]);
  return async function fetchWithRetry(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    let attempt = 0;
    // Cloneable init headers/body across retries when possible
    while (true) {
      try {
        const res = await fetch(input as RequestInfo | URL, init as RequestInit | undefined);
        if (transientStatus.has(res.status) && attempt < maxRetries) {
          attempt += 1;
          // Exponential backoff with jitter
          const delay = Math.min(150 * 2 ** (attempt - 1), 500);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return res;
      } catch (e) {
        if (attempt >= maxRetries) throw e;
        attempt += 1;
        const delay = Math.min(150 * 2 ** (attempt - 1), 500);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };
}
