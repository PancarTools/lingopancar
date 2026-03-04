import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	// Only apply basePath in production, not in development
	...(process.env.NODE_ENV === "production" && {
		basePath: "/lingopancar",
		assetPrefix: "/lingopancar",
	}),
};

export default nextConfig;
