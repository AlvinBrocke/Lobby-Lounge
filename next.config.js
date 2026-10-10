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
  // The marketing page lives at the root (/). It used to be served at
  // /landing-page and then /home; keep old links and search results working
  // (308 = permanent, and the browser keeps the #section anchor).
  async redirects() {
    return [
      { source: "/landing-page", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

module.exports = withMDX(nextConfig);
