/** @type {import('next').NextConfig} */

// When building for GitHub Pages (a project site served at /<repo>/), the app
// needs a basePath + assetPrefix. Locally these are empty so dev runs at /.
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "gym-tracker";

const nextConfig = {
  reactStrictMode: true,
  output: "export", // static HTML/JS export — no server needed
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : "",
  assetPrefix: isPages ? `/${repo}/` : "",
};

export default nextConfig;
