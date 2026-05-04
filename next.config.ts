import type { NextConfig } from "next";
// @ts-ignore
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback, 
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        os: false,
      };

      // Strip "node:" prefix so that resolve.fallback entries above handle them.
      // e.g. "node:fs" → "fs" → falls back to `false` (empty module).
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: any) => {
            resource.request = resource.request.replace(/^node:/, "");
          }
        )
      );
    }
    
    // pdfjs-dist conditionally requires Node.js 'canvas' package for server-side rendering.
    // In the browser, native Canvas/DOMMatrix exist so 'canvas' is never needed.
    // IgnorePlugin prevents webpack from bundling this dependency entirely.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/,
      })
    );

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

