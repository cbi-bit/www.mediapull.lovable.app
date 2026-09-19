import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { fetchPageImages, fetchUrlMetadata } from "@/lib/metadata.functions";
import { ActionButton, inputClass, StatusNote, ToolPanel } from "./shared";

function UrlForm({ value, onChange, onSubmit, busy, label, placeholder }: { value: string; onChange: (value: string) => void; onSubmit: (event: FormEvent) => void; busy: boolean; label: string; placeholder: string }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode="url" aria-label={label} className={`${inputClass} sm:flex-1`} />
      <button type="submit" disabled={busy || !value.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90 disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {label}
      </button>
    </form>
  );
}

type ExtractFormat = { url: string; ext: string; resolution?: string; note?: string; audio_only?: boolean };
type ExtractResult = { title?: string; thumbnail?: string; formats?: ExtractFormat[]; documents?: { url: string; name: string }[]; logs?: string[] };

export function MediaExtractor({ audioOnly = false }: { audioOnly?: boolean }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExtractResult | null>(null);

  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("url");
    if (shared) setUrl(shared);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Extraction failed.");
      setResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const formats = (result?.formats ?? []).filter((format) => (audioOnly ? format.audio_only : true));

  return (
    <ToolPanel>
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} label={audioOnly ? "Get audio" : "Pull media"} placeholder="Paste a link to a video, post or file" />
      {error ? <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="mt-6">
          <p className="text-base font-semibold">{result.title ?? "Ready to download"}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {formats.map((format) => (
              <a key={format.url} href={format.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-4 text-sm transition hover:border-primary">
                <span>
                  <span className="font-bold uppercase text-primary">{format.ext}</span>
                  <span className="ml-2 text-muted-foreground">{format.resolution ?? format.note ?? ""}</span>
                </span>
                <Download className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
          {!formats.length ? <p className="mt-4 text-sm text-muted-foreground">No matching files were found at that link.</p> : null}
        </div>
      ) : null}
      <StatusNote>Only download content you own or are allowed to save.</StatusNote>
    </ToolPanel>
  );
}

export function UrlMetadata() {
  const run = useServerFn(fetchUrlMetadata);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchUrlMetadata>> | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setData(null);
    try {
      setData(await run({ data: { url } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That page could not be checked.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} label="Inspect page" placeholder="https://example.com/article" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="mt-6 overflow-hidden rounded-md border border-border bg-background">
          {data.image ? <img src={data.image} alt="" className="h-48 w-full object-cover" /> : null}
          <div className="p-4">
            <p className="text-xs uppercase text-muted-foreground">{data.siteName} · {data.type}</p>
            <p className="mt-1 text-base font-semibold">{data.title || "No title tag found"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{data.description || "No description tag found."}</p>
          </div>
        </div>
      ) : null}
      <StatusNote>This is how your link looks when shared on social networks and chat apps.</StatusNote>
    </ToolPanel>
  );
}

export function ImageDownloader() {
  const run = useServerFn(fetchPageImages);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setImages([]);
    try {
      const result = await run({ data: { url } });
      setImages(result.images ?? []);
      if (!(result.images ?? []).length) setError("No pictures were found on that page.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That page could not be read.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} label="Find pictures" placeholder="Paste a page address" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {images.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <a key={image} href={image} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-md border border-border bg-background">
              <img src={image} alt="" loading="lazy" className="h-28 w-full object-cover transition group-hover:scale-105" />
              <span className="block p-2 text-center text-xs font-semibold text-primary">Open / save</span>
            </a>
          ))}
        </div>
      ) : null}
      <StatusNote>Right-click or long-press an opened picture to save it at full size.</StatusNote>
    </ToolPanel>
  );
}

export function SocialCaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("friendly");
  const [posts, setPosts] = useState<string[]>([]);

  function generate() {
    const subject = topic.trim() || "your content";
    const templates: Record<string, string[]> = {
      friendly: [
        `Saved you a click: everything you need to know about ${subject}. 👇`,
        `We tried ${subject} so you don't have to. Here's what actually worked.`,
        `Three quick tips for ${subject} — number two changed everything for us.`,
      ],
      bold: [
        `Stop overthinking ${subject}. Do this instead.`,
        `${subject}, done right in under a minute. No sign-up, no fee.`,
        `Everyone gets ${subject} wrong. Here's the fix.`,
      ],
      professional: [
        `A short guide to ${subject}, based on what we see every day.`,
        `Practical notes on ${subject} for teams that move fast.`,
        `How to approach ${subject} without adding another tool to your stack.`,
      ],
    };
    setPosts(templates[tone] ?? []);
  }

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
          Topic
          <input className={inputClass} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="free pdf merging" />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
          Tone
          <select className={inputClass} value={tone} onChange={(event) => setTone(event.target.value)}>
            <option value="friendly">Friendly</option>
            <option value="bold">Bold</option>
            <option value="professional">Professional</option>
          </select>
        </label>
        <ActionButton onClick={generate}>Generate posts</ActionButton>
      </div>
      {posts.length ? (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post} className="flex items-start justify-between gap-4 rounded-md border border-border bg-background p-4 text-sm">
              <span>{post}</span>
              <button type="button" onClick={() => navigator.clipboard.writeText(post)} className="shrink-0 rounded border border-border px-2 py-1 text-xs font-semibold">Copy</button>
            </li>
          ))}
        </ul>
      ) : null}
    </ToolPanel>
  );
}
