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
  // The marketing page moved from /landing-page to /home; keep old links and
  // search results working (308 = permanent, and keeps the #section anchor).
  async redirects() {
    return [{ source: "/landing-page", destination: "/home", permanent: true }];
  },
};

module.exports = withMDX(nextConfig);
