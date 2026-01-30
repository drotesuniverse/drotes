import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "drotes.com",
            },
            {
                protocol: "https",
                hostname: "bck.drotes.com",
            },
            {
                protocol: "https",
                hostname: "secure.gravatar.com",
            },
            {
                protocol: "http",
                hostname: "drotes.com",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            }
        ],
    },
};

export default nextConfig;
