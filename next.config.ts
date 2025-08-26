import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compiler options para melhor performance
  compiler: {
    // Remove console.log em produção (exceto error e warn)
    removeConsole: isDev ? false : {
      exclude: ["error", "warn"],
    },
  },

  // Otimização de imagens
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 ano
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Output standalone para menor tamanho de deploy
  output: "standalone",

  // PoweredBy header removido por segurança
  poweredByHeader: false,

  // Experimental features estáveis em 2025
  experimental: {
    // Otimização de memória durante build
    webpackMemoryOptimizations: true,

    // Build worker para reduzir uso de memória
    webpackBuildWorker: true,

    // Melhora tree-shaking para pacotes específicos
    optimizePackageImports: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      "@tabler/icons-react",
      "lucide-react",
      "lodash",
      "recharts",
      "date-fns",
    ],
  },

  // Pacotes que devem usar require nativo do Node.js
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],

  // Webpack optimizations
  webpack: (
    config: import("webpack").Configuration,
    { isServer }: { isServer: boolean },
  ) => {
    // Otimização de chunks apenas em produção no cliente
    if (!isDev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React, React DOM)
            framework: {
              name: "framework",
              chunks: "all",
              test:
                /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Lib chunk para pacotes grandes
            lib: {
              test(module: { size: () => number; identifier: () => string }) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier());
              },
              name(module: { identifier: () => string }) {
                const crypto = require("node:crypto");
                const hash = crypto.createHash("sha1").update(
                  module.identifier(),
                ).digest("hex");
                return `lib-${hash.substring(0, 8)}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Commons chunk para código compartilhado
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            // UI components compartilhados
            shared: {
              name: "shared",
              test: /[\\/]components[\\/]ui[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Headers para cache e segurança
  async headers() {
    // Dev mode - sem cache
    if (isDev) {
      return [
        {
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, max-age=0, must-revalidate",
            },
          ],
        },
      ];
    }

    // Production - headers de segurança e cache agressivo
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
