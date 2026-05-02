import type { NextConfig } from "next";
// @ts-ignore
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback, 
        fs: false,
      };
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
};

export default nextConfig;
