import { useState } from "react";
import { ActionButton, downloadBlob, Field, FilePicker, inputClass, Row, StatusNote, ToolPanel } from "./shared";

async function loadPdfLib() {
  return await import("pdf-lib");
}

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  function move(index: number, direction: -1 | 1) {
    setFiles((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index]!, next[target]!] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function run() {
    setError("");
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (const file of files) {
        const source = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      downloadBlob(new Blob([(await merged.save()) as BlobPart], { type: "application/pdf" }), "merged.pdf");
    } catch {
      setError("One of those PDFs could not be read. Password-protected files are not supported.");
    }
  }

  return (
    <ToolPanel>
      <FilePicker accept="application/pdf" multiple onFiles={(picked) => setFiles((current) => [...current, ...picked])} label="Add PDF files" hint="Add two or more PDFs, then set the order." />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      <ol className="mt-6 space-y-2">
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm">
            <span className="text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
            <button type="button" onClick={() => move(index, -1)} aria-label={`Move ${file.name} up`} className="rounded border border-border px-2 py-1 text-xs">↑</button>
            <button type="button" onClick={() => move(index, 1)} aria-label={`Move ${file.name} down`} className="rounded border border-border px-2 py-1 text-xs">↓</button>
            <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`} className="rounded border border-border px-2 py-1 text-xs">✕</button>
          </li>
        ))}
      </ol>
      <Row><ActionButton onClick={run} disabled={files.length < 2}>Merge and download</ActionButton></Row>
      <StatusNote>Files are combined on your device in the order shown above.</StatusNote>
    </ToolPanel>
  );
}

export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [error, setError] = useState("");

  async function pick(files: File[]) {
    setError("");
    const picked = files[0]!;
    try {
      const { PDFDocument } = await loadPdfLib();
      const document = await PDFDocument.load(await picked.arrayBuffer());
      setFile(picked);
      setPageCount(document.getPageCount());
      setFrom(1);
      setTo(document.getPageCount());
    } catch {
      setError("That PDF could not be read.");
    }
  }

  async function run() {
    if (!file) return;
    const { PDFDocument } = await loadPdfLib();
    const source = await PDFDocument.load(await file.arrayBuffer());
    const output = await PDFDocument.create();
    const start = Math.max(1, Math.min(from, pageCount));
    const end = Math.max(start, Math.min(to, pageCount));
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const pages = await output.copyPages(source, indices);
    pages.forEach((page) => output.addPage(page));
    downloadBlob(new Blob([(await output.save()) as BlobPart], { type: "application/pdf" }), `pages-${start}-${end}.pdf`);
  }

  return (
    <ToolPanel>
      <FilePicker accept="application/pdf" onFiles={pick} label="Choose a PDF" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {file ? <p className="mt-4 text-sm text-muted-foreground">{file.name} · {pageCount} pages</p> : null}
      <Row>
        <Field label="First page"><input type="number" min={1} max={pageCount || 1} className={inputClass} value={from} onChange={(event) => setFrom(Number(event.target.value))} /></Field>
        <Field label="Last page"><input type="number" min={1} max={pageCount || 1} className={inputClass} value={to} onChange={(event) => setTo(Number(event.target.value))} /></Field>
        <ActionButton onClick={run} disabled={!file}>Split and download</ActionButton>
      </Row>
    </ToolPanel>
  );
}

export function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(20);
  const [error, setError] = useState("");

  async function run() {
    if (!file) return;
    setError("");
    try {
      const { PDFDocument, StandardFonts, degrees, rgb } = await loadPdfLib();
      const document = await PDFDocument.load(await file.arrayBuffer());
      const font = await document.embedFont(StandardFonts.HelveticaBold);
      for (const page of document.getPages()) {
        const { width, height } = page.getSize();
        const size = Math.min(width, height) / Math.max(6, text.length) * 1.6;
        page.drawText(text, {
          x: width * 0.12,
          y: height * 0.35,
          size,
          font,
          color: rgb(0.05, 0.49, 1),
          opacity: opacity / 100,
          rotate: degrees(35),
        });
      }
      downloadBlob(new Blob([(await document.save()) as BlobPart], { type: "application/pdf" }), "watermarked.pdf");
    } catch {
      setError("That PDF could not be watermarked.");
    }
  }

  return (
    <ToolPanel>
      <FilePicker accept="application/pdf" onFiles={(files) => setFile(files[0]!)} label="Choose a PDF" />
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
      {file ? <p className="mt-4 text-sm text-muted-foreground">{file.name}</p> : null}
      <Row>
        <Field label="Watermark text"><input className={inputClass} value={text} onChange={(event) => setText(event.target.value)} /></Field>
        <Field label={`Strength ${opacity}%`}><input type="range" min={5} max={80} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
        <ActionButton onClick={run} disabled={!file || !text}>Add watermark</ActionButton>
      </Row>
    </ToolPanel>
  );
}
