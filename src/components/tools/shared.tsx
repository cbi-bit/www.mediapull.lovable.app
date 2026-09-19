import { Download, Upload } from "lucide-react";
import { useRef, type ChangeEvent, type ReactNode } from "react";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ToolPanel({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8">{children}</div>;
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-end gap-4">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-32 flex-1 flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-medium normal-case text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25";

export function ActionButton({ children, onClick, disabled, type = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-action transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
      <Download className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}

export function FilePicker({ accept, multiple, onFiles, label = "Choose a file", hint }: { accept: string; multiple?: boolean; onFiles: (files: File[]) => void; label?: string; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length) onFiles(files);
  }

  return (
    <div>
      <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 py-10 text-center transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Upload className="size-6 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{hint ?? "Your file stays on your device."}</span>
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="sr-only" />
    </div>
  );
}

export function StatusNote({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-xs text-muted-foreground">{children}</p>;
}

export async function loadImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), type, quality);
  });
}
