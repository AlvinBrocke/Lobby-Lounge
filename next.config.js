const withMDX = require("@next/mdx")({
  options: {
    // Turbopack serialises these options to Rust, so plugins must be passed by
    // package name (a string), not as an imported function.
    remarkPlugins: [["remark-gfm"]],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
turbopack: {
    root: __dirname,
  },
};

module.exports = withMDX(nextConfig);
