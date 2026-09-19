import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toolGroups, tools, type ToolGroup } from "@/lib/tools-catalog";

export function ToolCard({ slug, name, tagline, live, runsIn }: { slug: string; name: string; tagline: string; live: boolean; runsIn: "browser" | "service" }) {
  return (
    <Link to="/tools/$slug" params={{ slug }} className="group flex flex-col rounded-md border border-border bg-background p-5 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold">{name}</h3>
        <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase ${live ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{live ? "Free now" : "Soon"}</span>
      </div>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{tagline}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
        {runsIn === "browser" ? "Runs on your device" : "Uses our service"}
        <ArrowRight className="size-3 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function ToolsDirectory() {
  const [active, setActive] = useState<ToolGroup | "all">("all");
  const [query, setQuery] = useState("");

  const visible = tools.filter((tool) => {
    const matchesGroup = active === "all" || tool.group === active;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || tool.name.toLowerCase().includes(search) || tool.tagline.toLowerCase().includes(search);
    return matchesGroup && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as const, title: "All tools" }, ...toolGroups].map((group) => (
            <button key={group.id} type="button" onClick={() => setActive(group.id as ToolGroup | "all")} className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${active === group.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>
              {group.title}
            </button>
          ))}
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" aria-label="Search tools" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary sm:w-64" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((tool) => <ToolCard key={tool.slug} {...tool} />)}
      </div>
      {!visible.length ? <p className="mt-10 text-center text-sm text-muted-foreground">No tool matches that search yet.</p> : null}
    </div>
  );
}

export function HomeToolsSection() {
  return (
    <section id="tools" className="border-t border-border bg-background px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase text-primary">Essential tools</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything you need, all free</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Convert, edit, compress, and download. Most tools work entirely inside your browser, so your files never leave your device. No account, no limits.</p>
          </div>
          <Link to="/tools" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90">
            View all tools <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {toolGroups.map((group) => {
            const groupTools = tools.filter((tool) => tool.group === group.id);
            return (
              <article key={group.id} className="rounded-lg border border-border bg-card p-6 shadow-panel">
                <h3 className="text-lg font-semibold">{group.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {groupTools.slice(0, 8).map((tool) => (
                    <li key={tool.slug}>
                      <Link to="/tools/$slug" params={{ slug: tool.slug }} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:border-primary">
                        {tool.name}
                        {tool.live ? null : <span className="text-[10px] font-bold uppercase text-muted-foreground">soon</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">{groupTools.length} tools in this group</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
