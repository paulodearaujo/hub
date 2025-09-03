import { resolveSupabaseEnv } from "@/lib/supabase/config";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_NAME = "Dashboard SEO Clustering";
const APP_DESCRIPTION = "Análise de performance e agrupamento de conteúdo do blog";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.RENDER_EXTERNAL_URL
      ? `https://${process.env.RENDER_EXTERNAL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { url: SUPABASE_URL } = resolveSupabaseEnv();
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {SUPABASE_URL ? (
          <>
            <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={SUPABASE_URL} />
          </>
        ) : null}
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-20 focus:translate-y-0 transition-transform rounded-md bg-primary px-3 py-2 text-primary-foreground shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Pular para conteúdo
        </a>
        {/* biome-ignore lint/correctness/useUniqueElementIds: Static id required as skip-link target */}
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
