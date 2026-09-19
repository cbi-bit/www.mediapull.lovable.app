import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const requestSchema = z.object({ url: z.string().url().max(2048) });

export const Route = createFileRoute("/api/extract")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const extractorBaseUrl = process.env["EXTRACTOR_API_URL"];
        if (!extractorBaseUrl) {
          return Response.json(
            { detail: "The extraction service is not connected yet." },
            { status: 503 },
          );
        }

        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ detail: "Enter a valid public URL." }, { status: 400 });
        }

        const endpoint = `${extractorBaseUrl.replace(/\/$/, "")}/api/extract`;
        try {
          const upstream = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          });
          const body = await upstream.text();
          return new Response(body, {
            status: upstream.status,
            headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
          });
        } catch {
          return Response.json(
            { detail: "The extraction service is currently unreachable." },
            { status: 502 },
          );
        }
      },
    },
  },
});