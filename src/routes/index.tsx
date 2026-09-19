import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, FileText, Headphones, Image, Link2, LoaderCircle, Terminal, Video, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdSlot } from "../components/AdSlot";
import { MediaPullBrand } from "../components/MediaPullBrand";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { HomeToolsSection } from "../components/tools/ToolsDirectory";

type ExtractedFormat = {
  format_id?: string;
  ext?: string;
  resolution?: string;
  url?: string;
  note?: string;
};

type ExtractionResult = {
  success: boolean;
  type: "document" | "video_audio";
  title: string;
  thumbnail?: string;
  duration?: number;
  logs?: string[];
  formats: ExtractedFormat[];
};

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const audioExtensions = new Set(["aac", "flac", "m4a", "mp3", "ogg", "opus", "wav", "weba"]);

function isAudioFormat(format: ExtractedFormat) {
  const description = `${format.resolution ?? ""} ${format.note ?? ""}`.toLowerCase();
  return audioExtensions.has(format.ext?.toLowerCase() ?? "") || description.includes("audio only");
}

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "MediaPull.co — Free media downloader and online tools" },
      { name: "description", content: "Paste a link to pull videos, audio, pictures and documents, plus 35 free PDF, image and media tools. No account, files stay on your device." },
      { property: "og:title", content: "MediaPull.co — Free media downloader and online tools" },
      { property: "og:description", content: "Paste a link to pull videos, audio, pictures and documents, plus 35 free PDF, image and media tools. No account needed." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mediapull.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mediapull.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MediaPull.co",
          url: "https://mediapull.lovable.app/",
          description: "Free media extraction and browser-based media, PDF and image tools.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleExtract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as ExtractionResult | { detail?: string } | null;
      if (!response.ok) {
        throw new Error(payload && "detail" in payload ? payload.detail : "The extractor could not process this link.");
      }
      if (!payload || !("formats" in payload)) {
        throw new Error("The extractor returned an invalid response.");
      }
      setResult(payload);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The extractor could not process this link.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <section id="workspace" className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-8 sm:py-14 md:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
            <span className="h-px w-8 bg-primary" />
            Universal extraction engine
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Pull the media.<br /><span className="text-primary">Keep the quality.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            One focused workspace for extracting public video, audio, and document links across the web.
          </p>

          <form className="mt-8 flex max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row" onSubmit={handleExtract}>
            <label className="sr-only" htmlFor="media-url">Media or document URL</label>
            <input id="media-url" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste a public media link" className="h-13 min-w-0 flex-1 rounded-md border border-input bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25" />
            <button type="submit" disabled={isLoading} className="inline-flex h-13 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70">
              {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
              {isLoading ? "Extracting" : "Pull media"}
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Only download content you have permission to use. Downloads go straight to your computer — MediaPull never stores your files.</p>
          {error ? (
            <div role="alert" className="mt-5 flex max-w-xl items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:mr-0">
          <div className="absolute inset-8 rounded-full border border-primary/15 animate-orbit" aria-hidden="true" />
          <div className="relative grid aspect-square place-items-center rounded-[2rem] border border-border bg-panel shadow-panel">
            <div className="absolute left-6 top-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="size-1.5 rounded-full bg-status" /> LIVE IDENTITY
            </div>
            <div className="text-center">
              <div className="mx-auto grid size-40 place-items-center rounded-[2rem] border border-primary/30 bg-icon-surface shadow-icon sm:size-48">
                <MediaPullBrand compact className="size-32 sm:size-40" />
              </div>
              <p className="mt-6 text-sm font-semibold">MediaPull</p>
              <p className="mt-1 text-xs text-muted-foreground">Ready for your home screen</p>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>Android · iOS · Desktop</span><span className="text-primary">Adaptive icon</span>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="border-t border-border bg-background/80 px-5 py-14 sm:px-8" aria-live="polite">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
              <div className="flex min-w-0 gap-4">
                {result.thumbnail ? <img src={result.thumbnail} alt="" className="h-20 w-28 shrink-0 rounded-md border border-border object-cover" /> : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-md border border-border bg-secondary text-primary">
                    {result.type === "document" ? <FileText className="size-7" /> : <Video className="size-7" />}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-status">
                    <CheckCircle2 className="size-4" /> Extraction complete
                  </div>
                  <h2 className="break-words text-2xl font-bold sm:text-3xl">{result.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.formats.length} {result.type === "document" ? "document" : "format"}{result.formats.length === 1 ? "" : "s"}
                    {formatDuration(result.duration) ? ` · ${formatDuration(result.duration)}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Available files</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {result.formats.map((format, index) => {
                    const audioOnly = result.type === "video_audio" && isAudioFormat(format);
                    return (
                    <article key={`${format.format_id ?? "format"}-${index}`} className="flex min-h-36 flex-col justify-between rounded-md border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid size-9 place-items-center rounded-md bg-secondary text-primary">
                           {result.type === "document" ? <FileText className="size-4" /> : audioOnly ? <Headphones className="size-4" /> : <Video className="size-4" />}
                        </div>
                        <span className="rounded bg-secondary px-2 py-1 text-xs font-bold uppercase text-secondary-foreground">{format.ext ?? "file"}</span>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                           <p className="truncate text-sm font-semibold">{audioOnly ? "Audio only" : format.resolution ?? format.note ?? "Original"}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{format.note ?? `Format ${format.format_id ?? index + 1}`}</p>
                        </div>
                        {format.url ? (
                           <a href={format.url} target="_blank" rel="noreferrer" aria-label={audioOnly ? `Download audio ${format.ext ?? "file"}` : `Download ${format.resolution ?? format.ext ?? "file"}`} title={audioOnly ? "Download audio" : "Download file"} className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Download className="size-4" />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );})}
                </div>
              </div>

              <aside className="rounded-md border border-border bg-icon-surface p-5">
                <div className="flex items-center gap-2 border-b border-border pb-4 text-xs font-semibold uppercase text-muted-foreground">
                  <Terminal className="size-4 text-primary" /> Processing log
                </div>
                <ol className="mt-5 space-y-4">
                  {(result.logs ?? ["Extraction completed successfully."]).map((log, index) => (
                    <li key={`${log}-${index}`} className="flex gap-3 text-xs leading-5 text-muted-foreground">
                      <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
                      <span>{log}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          </div>
        </section>
      ) : null}
      <HomeToolsSection />
      <section id="how-it-works" className="border-t border-border bg-icon-surface px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase text-primary">Simple by design</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Download in three steps</h2><p className="mt-4 leading-7 text-muted-foreground">MediaPull is free to use. Paste a public link and choose from the files that the source makes available. Your files are saved on your device only — we do not keep copies or collect your files.</p></div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {[{ icon: Link2, n: "01", title: "Copy and paste", body: "Copy the public page or file link for your video, picture, PDF, document, or audio." }, { icon: LoaderCircle, n: "02", title: "Pull available files", body: "MediaPull checks the source and lists the formats, resolutions, and documents it can find." }, { icon: Download, n: "03", title: "Choose a format", body: "Select the download icon beside the format you want. Your browser opens the original file source." }].map((step) => <article key={step.n} className="bg-background p-7"><div className="flex items-center justify-between"><step.icon className="size-6 text-primary" /><span className="text-xs font-bold text-muted-foreground">{step.n}</span></div><h3 className="mt-8 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p></article>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">{[[Video,"Video"],[Headphones,"Audio"],[Image,"Pictures"],[FileText,"PDF & documents"]].map(([Icon,label]) => { const FeatureIcon = Icon as typeof Video; return <span key={label as string} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"><FeatureIcon className="size-4 text-primary" />{label as string}</span>; })}</div>
        </div>
      </section>
      <AdSlot />
      <SiteFooter />
    </main>
  );
}
