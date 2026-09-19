import { Link } from "@tanstack/react-router";
import { Menu, Search, Wrench } from "lucide-react";
import { useState } from "react";
import { toolGroups, tools } from "@/lib/tools-catalog";
import { MediaPullBrand } from "./MediaPullBrand";
import { ThemeToggle } from "./ThemePreference";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

function MobileToolsMenu() {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="shrink-0 md:hidden" aria-label="Open tools menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(92vw,24rem)] flex-col p-0">
        <SheetHeader className="border-b border-border px-5 pb-5 pt-6 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Wrench className="size-4" aria-hidden="true" />
            <SheetTitle>Choose a tool</SheetTitle>
          </div>
          <SheetDescription>Free tools for media, files, PDFs, and links.</SheetDescription>
          <label className="relative mt-3 block">
            <span className="sr-only">Search tools</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" className="pl-9" />
          </label>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <nav aria-label="Tools menu" className="space-y-7">
            {toolGroups.map((group) => {
              const matches = tools.filter((tool) => tool.group === group.id && (!search || tool.name.toLowerCase().includes(search) || tool.tagline.toLowerCase().includes(search)));
              if (!matches.length) return null;
              return (
                <section key={group.id}>
                  <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{group.title}</h3>
                  <div className="grid gap-1">
                    {matches.map((tool) => (
                      <SheetClose asChild key={tool.slug}>
                        <Link to="/tools/$slug" params={{ slug: tool.slug }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2.5 text-sm transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <span className="min-w-0 truncate font-medium">{tool.name}</span>
                          <span className={`text-[10px] font-bold uppercase ${tool.live ? "text-primary" : "text-muted-foreground"}`}>{tool.live ? "Free" : "Soon"}</span>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </section>
              );
            })}
            {search && !tools.some((tool) => tool.name.toLowerCase().includes(search) || tool.tagline.toLowerCase().includes(search)) ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No tool matches that search.</p>
            ) : null}
          </nav>
        </div>

        <div className="grid gap-2 border-t border-border bg-secondary/40 p-5">
          <SheetClose asChild><Link to="/tools" className="rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">View all tools</Link></SheetClose>
          <div className="grid grid-cols-2 gap-2">
            <SheetClose asChild><Link to="/" hash="how-it-works" className="rounded-md border border-border bg-background px-3 py-2 text-center text-xs font-semibold">How it works</Link></SheetClose>
            <SheetClose asChild><Link to="/privacy" className="rounded-md border border-border bg-background px-3 py-2 text-center text-xs font-semibold">Privacy</Link></SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto grid min-h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 sm:px-8 md:min-h-20" aria-label="Main navigation">
        <Link to="/" aria-label="MediaPull.co home" className="block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MediaPullBrand className="h-9 w-auto max-w-[11rem] md:h-11 md:max-w-none" />
        </Link>
        <div className="hidden items-center gap-1 md:flex lg:gap-2">
          <Link to="/tools" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Tools</Link>
          <Link to="/" hash="how-it-works" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">How it works</Link>
          <Link to="/privacy" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">Privacy</Link>
          <Link to="/" hash="workspace" className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Open workspace
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileToolsMenu />
        </div>
      </nav>
    </header>
  );
}