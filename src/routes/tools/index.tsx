import { createFileRoute } from "@tanstack/react-router";
import { AdSlot } from "@/components/AdSlot";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ExtensionCard } from "@/components/tools/ExtensionCard";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";

export const Route = createFileRoute("/tools/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Free online tools — MediaPull.co" },
      { name: "description", content: "Free PDF, image, video and audio tools. Convert, merge, resize, trim and download without an account. Most tools run inside your browser." },
      { property: "og:title", content: "Free online tools — MediaPull.co" },
      { property: "og:description", content: "Convert, merge, resize, trim and download media and documents for free, with no account." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mediapull.lovable.app/tools" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mediapull.lovable.app/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <p className="text-xs font-semibold uppercase text-primary">Toolbox</p>
        <h1 className="mt-3 text-4xl font-bold">Every MediaPull tool</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Free for everyone, no sign-up. Tools marked “Runs on your device” never upload your files anywhere.</p>
        <div className="mt-10"><ToolsDirectory /></div>
        <div className="mt-14"><ExtensionCard /></div>
      </section>
      <AdSlot />
      <SiteFooter />
    </main>
  );
}
