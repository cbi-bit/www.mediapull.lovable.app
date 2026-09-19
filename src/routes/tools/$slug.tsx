import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolCard } from "@/components/tools/ToolsDirectory";
import { toolComponents } from "@/components/tools/registry";
import { getTool, tools } from "@/lib/tools-catalog";

export const Route = createFileRoute("/tools/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ params, loaderData }) => {
    const tool = loaderData?.tool;
    const title = tool ? `${tool.name} — free online tool | MediaPull.co` : "Tool — MediaPull.co";
    const description = tool ? `${tool.tagline} Free, no account needed, on MediaPull.co.` : "Free online media and document tools.";
    const url = `https://mediapull.lovable.app/tools/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: tool
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: tool.name,
                description: tool.tagline,
                applicationCategory: "MultimediaApplication",
                operatingSystem: "Any",
                url,
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              }),
            },
          ]
        : [],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Component = toolComponents[tool.slug];
  const related = tools.filter((entry) => entry.group === tool.group && entry.slug !== tool.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <Link to="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> All tools
        </Link>
        <h1 className="mt-6 text-4xl font-bold">{tool.name}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{tool.tagline}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          {tool.runsIn === "browser" ? "Runs on your device — your file is never uploaded" : "Uses our service to read the link you paste"}
        </p>

        <div className="mt-8">
          {Component ? (
            <Component />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center shadow-panel">
              <Clock className="mx-auto size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">This tool is on the way</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {tool.name} needs heavier video processing than a browser can handle on its own. It will be free like everything else here the moment it is ready.
              </p>
              <Link to="/tools" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90">Browse the tools that are ready</Link>
            </div>
          )}
        </div>

        {related.length ? (
          <div className="mt-14">
            <h2 className="text-lg font-semibold">People also use</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((entry) => <ToolCard key={entry.slug} {...entry} />)}
            </div>
          </div>
        ) : null}
      </section>
      <aside className="border-t border-border bg-background px-5 py-8 sm:px-8" aria-label="Advertisement">
        <div className="mx-auto grid min-h-28 w-full max-w-5xl place-items-center rounded-md border border-dashed border-border bg-card text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Advertisement</p>
            <p className="mt-2 text-xs text-muted-foreground">Ad space helps keep MediaPull free.</p>
          </div>
        </div>
      </aside>
      <SiteFooter />
    </main>
  );
}
