import { useState } from "react";
import { ActionButton, downloadBlob, FilePicker, StatusNote, ToolPanel } from "./shared";

type Row = { label: string; value: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function hashFile(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function mediaRows(file: File): Promise<Row[]> {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith("image/")) {
      const image = new Image();
      image.src = url;
      await image.decode();
      return [
        { label: "Dimensions", value: `${image.naturalWidth} × ${image.naturalHeight} px` },
        { label: "Aspect ratio", value: (image.naturalWidth / image.naturalHeight).toFixed(3) },
      ];
    }
    if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      const isVideo = file.type.startsWith("video/");
      const element = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement;
      element.preload = "metadata";
      element.src = url;
      await new Promise<void>((resolve, reject) => {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => reject(new Error("unreadable"));
      });
      const minutes = Math.floor(element.duration / 60);
      const seconds = Math.floor(element.duration % 60);
      const rows: Row[] = [{ label: "Duration", value: `${minutes}m ${String(seconds).padStart(2, "0")}s` }];
      if (isVideo && element.videoWidth) {
        rows.push({ label: "Dimensions", value: `${element.videoWidth} × ${element.videoHeight} px` });
      }
      return rows;
    }
  } catch {
    return [];
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  return [];
}

export function FileInspector() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function inspect(files: File[]) {
    const picked = files[0]!;
    setFile(picked);
    setBusy(true);
    setRows([]);
    const base: Row[] = [
      { label: "File name", value: picked.name },
      { label: "Type", value: picked.type || "Unknown" },
      { label: "Size", value: formatBytes(picked.size) },
      { label: "Last modified", value: new Date(picked.lastModified).toLocaleString() },
      { label: "Extension", value: picked.name.includes(".") ? `.${picked.name.split(".").pop()}` : "None" },
    ];
    const extra = await mediaRows(picked);
    let checksum: Row[] = [];
    try {
      checksum = [{ label: "SHA-256", value: await hashFile(picked) }];
    } catch {
      checksum = [];
    }
    setRows([...base, ...extra, ...checksum]);
    setBusy(false);
  }

  return (
    <ToolPanel>
      <FilePicker accept="*/*" onFiles={inspect} label="Choose any file to inspect" hint="Nothing is uploaded — the file is read in your browser." />

      {busy ? <p className="mt-6 text-sm text-muted-foreground">Reading the file…</p> : null}

      {rows.length ? (
        <>
          <dl className="mt-6 divide-y divide-border rounded-lg border border-border">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-6">
                <dt className="w-40 shrink-0 text-xs font-semibold uppercase text-muted-foreground">{row.label}</dt>
                <dd className="break-all text-sm font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-4">
            <ActionButton onClick={() => file && downloadBlob(file, file.name)} disabled={!file}>
              Download the file
            </ActionButton>
            <ActionButton
              onClick={() => {
                if (!file) return;
                const text = rows.map((row) => `${row.label}: ${row.value}`).join("\n");
                downloadBlob(new Blob([text], { type: "text/plain" }), `${file.name}-details.txt`);
              }}
              disabled={!file}
            >
              Download the details
            </ActionButton>
          </div>
        </>
      ) : null}

      <StatusNote>
        This page never uploads your file. It is read in your browser, the details are shown to you, and the download
        comes straight from your own device — MediaPull keeps no copy and no record.
      </StatusNote>
    </ToolPanel>
  );
}
