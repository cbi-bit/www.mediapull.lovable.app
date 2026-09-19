import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ url: z.string().url() });

function pick(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1]!.trim().slice(0, 300);
  }
  return "";
}

export const fetchUrlMetadata = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const target = new URL(data.url);
    if (!/^https?:$/.test(target.protocol)) throw new Error("Only http and https links are supported.");

    const response = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MediaPullBot/1.0)" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`That page replied with status ${response.status}.`);
    const html = (await response.text()).slice(0, 400_000);

    const meta = (property: string) => [
      new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
    ];

    return {
      url: target.toString(),
      title: pick(html, [...meta("og:title"), ...meta("twitter:title"), /<title[^>]*>([^<]+)<\/title>/i]),
      description: pick(html, [...meta("og:description"), ...meta("twitter:description"), ...meta("description")]),
      image: pick(html, [...meta("og:image"), ...meta("twitter:image")]),
      siteName: pick(html, meta("og:site_name")) || target.hostname,
      type: pick(html, meta("og:type")) || "website",
    };
  });

export const fetchPageImages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const target = new URL(data.url);
    if (!/^https?:$/.test(target.protocol)) throw new Error("Only http and https links are supported.");

    const response = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MediaPullBot/1.0)" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`That page replied with status ${response.status}.`);
    const html = (await response.text()).slice(0, 400_000);

    const found = new Set<string>();
    for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      try {
        const absolute = new URL(match[1]!, target).toString();
        if (/^https?:/.test(absolute) && !absolute.startsWith("data:")) found.add(absolute);
      } catch {
        // skip unusable source
      }
      if (found.size >= 40) break;
    }

    return { images: Array.from(found) };
  });
