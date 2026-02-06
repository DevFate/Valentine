import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const repositorySlug = process.env.GITHUB_REPOSITORY ?? "";
const [repositoryOwner, repositoryName] = repositorySlug.split("/");
const isUserPage =
  repositoryOwner &&
  repositoryName &&
  repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
const basePath = isProduction && repositoryName && !isUserPage ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  assetPrefix: basePath,
  basePath,
  images: {
    unoptimized: true,
  },
  output: "export",
  reactCompiler: true,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
