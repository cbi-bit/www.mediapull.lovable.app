import { useState } from "react";
import { ActionButton, canvasToBlob, downloadBlob, Field, FilePicker, inputClass, loadImage, Row, StatusNote, ToolPanel } from "./shared";

type Loaded = { file: File; image: HTMLImageElement };

function usePicked() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  async function pick(files: File[]) {
    setError("");
    try {
      const file = files[0]!;
      setLoaded({ file, image: await loadImage(file) });
    } catch {
      setError("That image could not be opened.");
      setLoaded(null);
    }
  }
  return { loaded, error, pick };
}

function Preview({ loaded }: { loaded: Loaded }) {
  return (
    <div className="mt-6 flex items-center gap-4 rounded-md border border-border bg-background p-4">
      <img src={loaded.image.src} alt="" className="size-16 rounded object-cover" />
      <div className="min-w-0 text-sm">
        <p className="truncate font-semibold">{loaded.file.name}</p>
        <p className="text-xs text-muted-foreground">{loaded.image.naturalWidth} × {loaded.image.naturalHeight} px · {(loaded.file.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
  );
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export function FileConverter({ compress = false }: { compress?: boolean }) {
  const { loaded, error, pick } = usePicked();
  const [format, setFormat] = useState(compress ? "image/jpeg" : "image/png");
  const [quality, setQuality] = useState(compress ? 60 : 92);

  async function run() {
    if (!loaded) return;
    const canvas = document.createElement("canvas");
    canvas.width = loaded.image.naturalWidth;
    canvas.height = loaded.image.naturalHeight;
    const context = canvas.getContext("2d")!;
    if (format === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(loaded.image, 0, 0);
    const blob = await canvasToBlob(canvas, format, quality / 100);
    downloadBlob(blob, `${baseName(loaded.file.name)}.${format.split("/")[1]!.replace("jpeg", "jpg")}`);
  }

  return (
    <ToolPanel>
      <FilePicker accept="image/*" onFiles={pick} label="Choose an image" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loaded ? <Preview loaded={loaded} /> : null}
      <Row>
        <Field label="Output format">
          <select className={inputClass} value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </Field>
        <Field label={`Quality ${quality}%`}>
          <input type="range" min={20} max={100} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="h-11 w-full accent-primary" />
        </Field>
        <ActionButton onClick={run} disabled={!loaded}>{compress ? "Compress" : "Convert"} and download</ActionButton>
      </Row>
      <StatusNote>Conversion happens inside your browser, so nothing is uploaded anywhere.</StatusNote>
    </ToolPanel>
  );
}

export function ImageResizer() {
  const { loaded, error, pick } = usePicked();
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [lockRatio, setLockRatio] = useState(true);

  async function run() {
    if (!loaded) return;
    const ratio = loaded.image.naturalWidth / loaded.image.naturalHeight;
    const outWidth = Math.max(1, Math.round(width));
    const outHeight = lockRatio ? Math.round(outWidth / ratio) : Math.max(1, Math.round(height));
    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    canvas.getContext("2d")!.drawImage(loaded.image, 0, 0, outWidth, outHeight);
    downloadBlob(await canvasToBlob(canvas, "image/png"), `${baseName(loaded.file.name)}-${outWidth}x${outHeight}.png`);
  }

  return (
    <ToolPanel>
      <FilePicker accept="image/*" onFiles={pick} label="Choose an image" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loaded ? <Preview loaded={loaded} /> : null}
      <Row>
        <Field label="Width (px)"><input type="number" min={1} className={inputClass} value={width} onChange={(event) => setWidth(Number(event.target.value))} /></Field>
        <Field label="Height (px)"><input type="number" min={1} disabled={lockRatio} className={inputClass} value={height} onChange={(event) => setHeight(Number(event.target.value))} /></Field>
        <label className="flex h-11 items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} className="size-4 accent-primary" />
          Keep proportions
        </label>
        <ActionButton onClick={run} disabled={!loaded}>Resize and download</ActionButton>
      </Row>
    </ToolPanel>
  );
}

const socialPresets = [
  { label: "Instagram square", width: 1080, height: 1080 },
  { label: "Instagram story", width: 1080, height: 1920 },
  { label: "YouTube thumbnail", width: 1280, height: 720 },
  { label: "Facebook cover", width: 1640, height: 856 },
  { label: "X / Twitter post", width: 1600, height: 900 },
  { label: "LinkedIn banner", width: 1584, height: 396 },
  { label: "TikTok cover", width: 1080, height: 1920 },
  { label: "Pinterest pin", width: 1000, height: 1500 },
];

export function SocialImageResizer() {
  const { loaded, error, pick } = usePicked();
  const [busy, setBusy] = useState("");

  async function run(preset: (typeof socialPresets)[number]) {
    if (!loaded) return;
    setBusy(preset.label);
    const canvas = document.createElement("canvas");
    canvas.width = preset.width;
    canvas.height = preset.height;
    const context = canvas.getContext("2d")!;
    const scale = Math.max(preset.width / loaded.image.naturalWidth, preset.height / loaded.image.naturalHeight);
    const drawWidth = loaded.image.naturalWidth * scale;
    const drawHeight = loaded.image.naturalHeight * scale;
    context.drawImage(loaded.image, (preset.width - drawWidth) / 2, (preset.height - drawHeight) / 2, drawWidth, drawHeight);
    downloadBlob(await canvasToBlob(canvas, "image/jpeg", 0.92), `${baseName(loaded.file.name)}-${preset.width}x${preset.height}.jpg`);
    setBusy("");
  }

  return (
    <ToolPanel>
      <FilePicker accept="image/*" onFiles={pick} label="Choose an image" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loaded ? <Preview loaded={loaded} /> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {socialPresets.map((preset) => (
          <button key={preset.label} type="button" disabled={!loaded} onClick={() => run(preset)} className="rounded-md border border-border bg-background p-4 text-left transition hover:border-primary disabled:opacity-50">
            <p className="text-sm font-semibold">{preset.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{preset.width} × {preset.height}{busy === preset.label ? " · saving" : ""}</p>
          </button>
        ))}
      </div>
      <StatusNote>Each size is centre-cropped to fill the frame, then downloaded as a JPG.</StatusNote>
    </ToolPanel>
  );
}

export function ImageEditor() {
  const { loaded, error, pick } = usePicked();
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  async function run() {
    if (!loaded) return;
    const swapped = rotation % 180 !== 0;
    const width = swapped ? loaded.image.naturalHeight : loaded.image.naturalWidth;
    const height = swapped ? loaded.image.naturalWidth : loaded.image.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    context.filter = filter;
    context.translate(width / 2, height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(flip ? -1 : 1, 1);
    context.drawImage(loaded.image, -loaded.image.naturalWidth / 2, -loaded.image.naturalHeight / 2);
    downloadBlob(await canvasToBlob(canvas, "image/png"), `${baseName(loaded.file.name)}-edited.png`);
  }

  return (
    <ToolPanel>
      <FilePicker accept="image/*" onFiles={pick} label="Choose an image" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loaded ? (
        <div className="mt-6 grid place-items-center rounded-md border border-border bg-background p-4">
          <img src={loaded.image.src} alt="Preview of your edit" style={{ filter, transform: `rotate(${rotation}deg) scaleX(${flip ? -1 : 1})` }} className="max-h-72 w-auto" />
        </div>
      ) : null}
      <Row>
        <Field label={`Brightness ${brightness}%`}><input type="range" min={20} max={200} value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
        <Field label={`Contrast ${contrast}%`}><input type="range" min={20} max={200} value={contrast} onChange={(event) => setContrast(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
        <Field label={`Colour ${saturation}%`}><input type="range" min={0} max={200} value={saturation} onChange={(event) => setSaturation(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
      </Row>
      <Row>
        <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)} className="h-11 rounded-md border border-border bg-secondary px-4 text-sm font-semibold">Rotate 90°</button>
        <button type="button" onClick={() => setFlip((value) => !value)} className="h-11 rounded-md border border-border bg-secondary px-4 text-sm font-semibold">Flip</button>
        <ActionButton onClick={run} disabled={!loaded}>Save image</ActionButton>
      </Row>
    </ToolPanel>
  );
}

export function MemeGenerator() {
  const { loaded, error, pick } = usePicked();
  const [top, setTop] = useState("WHEN THE DOWNLOAD");
  const [bottom, setBottom] = useState("FINISHES IN ONE CLICK");

  async function run() {
    if (!loaded) return;
    const canvas = document.createElement("canvas");
    canvas.width = loaded.image.naturalWidth;
    canvas.height = loaded.image.naturalHeight;
    const context = canvas.getContext("2d")!;
    context.drawImage(loaded.image, 0, 0);
    const fontSize = Math.round(canvas.width / 10);
    context.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
    context.textAlign = "center";
    context.lineWidth = Math.max(2, fontSize / 12);
    context.strokeStyle = "#000000";
    context.fillStyle = "#ffffff";
    const draw = (text: string, y: number) => {
      const value = text.toUpperCase();
      context.strokeText(value, canvas.width / 2, y, canvas.width * 0.92);
      context.fillText(value, canvas.width / 2, y, canvas.width * 0.92);
    };
    if (top) draw(top, fontSize * 1.15);
    if (bottom) draw(bottom, canvas.height - fontSize * 0.4);
    downloadBlob(await canvasToBlob(canvas, "image/png"), "meme.png");
  }

  return (
    <ToolPanel>
      <FilePicker accept="image/*" onFiles={pick} label="Choose a picture" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loaded ? <Preview loaded={loaded} /> : null}
      <Row>
        <Field label="Top text"><input className={inputClass} value={top} onChange={(event) => setTop(event.target.value)} /></Field>
        <Field label="Bottom text"><input className={inputClass} value={bottom} onChange={(event) => setBottom(event.target.value)} /></Field>
        <ActionButton onClick={run} disabled={!loaded}>Download meme</ActionButton>
      </Row>
    </ToolPanel>
  );
}
