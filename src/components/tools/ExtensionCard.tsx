import { Chrome, Download } from "lucide-react";
import { useState } from "react";

export function ExtensionCard() {
  const [error, setError] = useState("");

  function download() {
    setError("");
    fetch("/mediapull-extension.zip")
      .then((response) => {
        if (!response.ok) throw new Error("The download is not available right now.");
        return response.blob();
      })
      .then((blob) => {
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = "mediapull-extension.zip";
        anchor.click();
        URL.revokeObjectURL(anchor.href);
      })
      .catch((cause: Error) => setError(cause.message));
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Chrome className="size-4" aria-hidden="true" /> Browser extension</p>
          <h2 className="mt-3 text-2xl font-bold">Keep the whole toolbox one click away</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Works in Chrome, Edge, Brave, Arc and Opera. Right-click any page, link or picture and send it straight to the right MediaPull tool.</p>
        </div>
        <button type="button" onClick={download} className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90">
          <Download className="size-4" aria-hidden="true" /> Download extension
        </button>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      <ol className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
        {["Unzip the downloaded file.", "Open chrome://extensions in your browser.", "Turn on Developer mode, top right.", "Click “Load unpacked” and pick the folder."].map((step, index) => (
          <li key={step} className="rounded-md border border-border bg-background p-4">
            <span className="text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <p className="mt-2 leading-6">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
