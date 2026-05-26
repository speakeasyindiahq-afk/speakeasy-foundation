import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const domain = "https://speakeasyindia.online";
          const now = new Date().toISOString().split("T")[0];

          // 1. Static Pages
          const staticPaths = [
            "",
            "/about",
            "/contact",
            "/disclaimer",
            "/privacy",
            "/resources",
            "/sawal-jawab",
            "/learn",
            "/myth",
            "/audio",
            "/search",
          ];

          // 2. Fetch dynamic paths from Supabase
          const [articlesRes, mythsRes, audioRes] = await Promise.all([
            supabase.from("articles").select("category,slug").eq("status", "published"),
            supabase.from("myths").select("slug").eq("status", "published"),
            supabase.from("audio_episodes").select("slug").eq("status", "published"),
          ]);

          const urls: string[] = [];

          // Add static URLs
          staticPaths.forEach((path) => {
            urls.push(`  <url>
    <loc>${domain}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`);
          });

          // Add Articles
          if (articlesRes.data) {
            articlesRes.data.forEach((a) => {
              if (a.category && a.slug) {
                urls.push(`  <url>
    <loc>${domain}/learn/${a.category}/${a.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
              }
            });
          }

          // Add Myths
          if (mythsRes.data) {
            mythsRes.data.forEach((m) => {
              if (m.slug) {
                urls.push(`  <url>
    <loc>${domain}/myth/${m.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
              }
            });
          }

          // Add Audio Episodes
          if (audioRes.data) {
            audioRes.data.forEach((ep) => {
              if (ep.slug) {
                urls.push(`  <url>
    <loc>${domain}/audio/${ep.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
              }
            });
          }

          const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
            },
          });
        } catch (error) {
          console.error("Sitemap generation error:", error);
          // Return a basic static sitemap fallback if Supabase fails (resilient)
          const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://speakeasyindia.online</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;
          return new Response(fallbackXml, {
            status: 200,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
            },
          });
        }
      },
    },
  },
});
