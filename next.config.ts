import type { NextConfig } from "next";

/**
 * Other projects served under maiacoelho.design (Next.js multi-zones): maiacoelho.design/<path>
 * is proxied, not redirected, to that project's own Vercel deployment, so the address bar keeps
 * maiacoelho.design/<path>.
 *
 * Each zone project must serve everything under its own path (Next.js: `basePath: "/onboard"`;
 * Vite: `base: "/onboard/"`) and must NOT have maiacoelho.design added to it. Override a zone's
 * origin with its env var (Vercel → maiacoelho-buck → Settings → Environment Variables, then
 * redeploy); rewrites are read at build time.
 *
 * Add a site: one line here, a project with that basePath, redeploy this project.
 */
const ZONES = [
  { path: "/mott-bow", origin: process.env.ZONE_MOTT_BOW_URL ?? "https://maiacoelho-mott-bow.vercel.app" },
  { path: "/onboard", origin: process.env.ZONE_ONBOARD_URL ?? "https://maiacoelho-onboard.vercel.app" },
  { path: "/awaken", origin: process.env.ZONE_AWAKEN_URL ?? "https://awaken-bakery.vercel.app" },
  { path: "/ironphysique", origin: process.env.ZONE_IRONPHYSIQUE_URL ?? "https://iron-physique-gym.vercel.app" },
  { path: "/vivahype", origin: process.env.ZONE_VIVAHYPE_URL ?? "https://vivahype.vercel.app" },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      // before this app's own pages and files, so a zone's path always reaches the zone
      beforeFiles: ZONES.flatMap(({ path, origin }) => {
        const base = origin.replace(/\/$/, "");
        return [
          { source: path, destination: `${base}${path}` },
          { source: `${path}/:rest*`, destination: `${base}${path}/:rest*` },
        ];
      }),
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
