import { useState } from "react";
import { ActionButton, downloadBlob, Field, FilePicker, inputClass, Row, StatusNote, ToolPanel } from "./shared";

export function SplitMergeFiles() {
  const [file, setFile] = useState<File | null>(null);
  const [parts, setParts] = useState<File[]>([]);
  const [chunkMb, setChunkMb] = useState(10);

  function split() {
    if (!file) return;
    const size = chunkMb * 1024 * 1024;
    const total = Math.ceil(file.size / size);
    for (let index = 0; index < total; index += 1) {
      const blob = file.slice(index * size, (index + 1) * size);
      downloadBlob(blob, `${file.name}.part${String(index + 1).padStart(3, "0")}`);
    }
  }

  function join() {
    if (parts.length < 2) return;
    const ordered = [...parts].sort((a, b) => a.name.localeCompare(b.name));
    const name = ordered[0]!.name.replace(/\.part\d+$/i, "") || "joined-file";
    downloadBlob(new Blob(ordered), name);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ToolPanel>
        <h2 className="text-lg font-semibold">Split a large file</h2>
        <div className="mt-4"><FilePicker accept="*/*" onFiles={(files) => setFile(files[0]!)} label="Choose a file" /></div>
        {file ? <p className="mt-4 text-sm text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p> : null}
        <Row>
          <Field label="Chunk size (MB)"><input type="number" min={1} className={inputClass} value={chunkMb} onChange={(event) => setChunkMb(Math.max(1, Number(event.target.value)))} /></Field>
          <ActionButton onClick={split} disabled={!file}>Download parts</ActionButton>
        </Row>
      </ToolPanel>
      <ToolPanel>
        <h2 className="text-lg font-semibold">Join the parts back</h2>
        <div className="mt-4"><FilePicker accept="*/*" multiple onFiles={(files) => setParts((current) => [...current, ...files])} label="Add the part files" hint="Parts are joined in name order." /></div>
        {parts.length ? <p className="mt-4 text-sm text-muted-foreground">{parts.length} parts selected</p> : null}
        <Row><ActionButton onClick={join} disabled={parts.length < 2}>Join and download</ActionButton></Row>
        <StatusNote>Everything is handled on your device, so even very large files stay private.</StatusNote>
      </ToolPanel>
    </div>
  );
}

export function SubtitleConverter() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("subtitles");

  const isVtt = input.trimStart().toUpperCase().startsWith("WEBVTT");

  function convert() {
    if (!input.trim()) return;
    let output: string;
    if (isVtt) {
      const body = input.replace(/^WEBVTT.*\n/, "").replace(/^NOTE[\s\S]*?\n\n/gm, "").trim();
      const blocks = body.split(/\n\s*\n/).filter(Boolean);
      output = blocks
        .map((block, index) => {
          const lines = block.split("\n").filter((line) => !/^\d+$/.test(line.trim()));
          const timed = lines.map((line) => (line.includes("-->") ? line.replace(/\./g, ",").split(" line:")[0]!.trim() : line));
          return `${index + 1}\n${timed.join("\n")}`;
        })
        .join("\n\n");
    } else {
      const body = input.trim().replace(/\r/g, "");
      output = `WEBVTT\n\n${body.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")}`;
    }
    downloadBlob(new Blob([output], { type: "text/plain" }), `${name || "subtitles"}.${isVtt ? "srt" : "vtt"}`);
  }

  async function pick(files: File[]) {
    const file = files[0]!;
    setName(file.name.replace(/\.[^.]+$/, ""));
    setInput(await file.text());
  }

  return (
    <ToolPanel>
      <FilePicker accept=".srt,.vtt,text/plain" onFiles={pick} label="Choose an SRT or VTT file" />
      <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} placeholder="…or paste the captions here" className="mt-6 w-full rounded-md border border-input bg-background p-4 font-mono text-xs text-foreground outline-none focus:border-primary" />
      <Row>
        <p className="text-sm text-muted-foreground">{input.trim() ? (isVtt ? "Detected WebVTT → converts to SRT" : "Detected SRT → converts to WebVTT") : "Add captions to begin."}</p>
        <ActionButton onClick={convert} disabled={!input.trim()}>Convert and download</ActionButton>
      </Row>
    </ToolPanel>
  );
}

type MetaRow = { label: string; value: string };

export function MediaMetadata() {
  const [rows, setRows] = useState<MetaRow[]>([]);
  const [error, setError] = useState("");

  async function pick(files: File[]) {
    setError("");
    const file = files[0]!;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video");
    const element = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement;
    element.preload = "metadata";
    element.src = url;
    try {
      await new Promise<void>((resolve, reject) => {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => reject(new Error("unreadable"));
      });
      const minutes = Math.floor(element.duration / 60);
      const seconds = Math.floor(element.duration % 60);
      setRows([
        { label: "File name", value: file.name },
        { label: "Type", value: file.type || "unknown" },
        { label: "Size", value: `${(file.size / 1024 / 1024).toFixed(2)} MB` },
        { label: "Duration", value: `${minutes}:${String(seconds).padStart(2, "0")}` },
        ...(isVideo ? [{ label: "Resolution", value: `${element.videoWidth} × ${element.videoHeight}` }] : []),
        { label: "Last modified", value: new Date(file.lastModified).toLocaleString() },
      ]);
    } catch {
      setError("That file could not be read by your browser.");
      setRows([]);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <ToolPanel>
      <FilePicker accept="video/*,audio/*" onFiles={pick} label="Choose a video or audio file" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {rows.length ? (
        <dl className="mt-6 divide-y divide-border rounded-md border border-border">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 p-4 text-sm">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 truncate font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </ToolPanel>
  );
}

function encodeWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const samples = buffer.length;
  const dataLength = samples * channels * 2;
  const output = new DataView(new ArrayBuffer(44 + dataLength));
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) output.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  output.setUint32(4, 36 + dataLength, true);
  writeText(8, "WAVEfmt ");
  output.setUint32(16, 16, true);
  output.setUint16(20, 1, true);
  output.setUint16(22, channels, true);
  output.setUint32(24, buffer.sampleRate, true);
  output.setUint32(28, buffer.sampleRate * channels * 2, true);
  output.setUint16(32, channels * 2, true);
  output.setUint16(34, 16, true);
  writeText(36, "data");
  output.setUint32(40, dataLength, true);
  let offset = 44;
  for (let index = 0; index < samples; index += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[index]!));
      output.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([output.buffer as BlobPart], { type: "audio/wav" });
}

export function AudioTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(files: File[]) {
    setError("");
    const picked = files[0]!;
    const url = URL.createObjectURL(picked);
    const element = new Audio(url);
    element.preload = "metadata";
    try {
      await new Promise<void>((resolve, reject) => {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => reject(new Error("unreadable"));
      });
      setFile(picked);
      setDuration(Math.floor(element.duration));
      setStart(0);
      setEnd(Math.floor(element.duration));
    } catch {
      setError("That audio file could not be read.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const context = new AudioContext();
      const decoded = await context.decodeAudioData(await file.arrayBuffer());
      const from = Math.max(0, Math.min(start, decoded.duration));
      const to = Math.max(from + 0.1, Math.min(end, decoded.duration));
      const frames = Math.round((to - from) * decoded.sampleRate);
      const trimmed = new AudioBuffer({ length: frames, numberOfChannels: decoded.numberOfChannels, sampleRate: decoded.sampleRate });
      for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
        trimmed.copyToChannel(decoded.getChannelData(channel).subarray(Math.round(from * decoded.sampleRate), Math.round(from * decoded.sampleRate) + frames), channel);
      }
      downloadBlob(encodeWav(trimmed), `${file.name.replace(/\.[^.]+$/, "")}-trimmed.wav`);
      await context.close();
    } catch {
      setError("This audio format could not be decoded by your browser.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <FilePicker accept="audio/*" onFiles={pick} label="Choose an audio file" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {file ? <p className="mt-4 text-sm text-muted-foreground">{file.name} · {duration}s</p> : null}
      <Row>
        <Field label={`Start ${start}s`}><input type="range" min={0} max={duration} value={start} onChange={(event) => setStart(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
        <Field label={`End ${end}s`}><input type="range" min={0} max={duration} value={end} onChange={(event) => setEnd(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
        <ActionButton onClick={run} disabled={!file || busy || end <= start}>{busy ? "Working" : "Trim and download"}</ActionButton>
      </Row>
      <StatusNote>The trimmed clip is exported as a high-quality WAV file.</StatusNote>
    </ToolPanel>
  );
}
