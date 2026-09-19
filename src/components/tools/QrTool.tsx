import { useEffect, useState } from "react";
import { ActionButton, downloadBlob, Field, inputClass, Row, StatusNote, ToolPanel } from "./shared";

export function QrGenerator() {
  const [value, setValue] = useState("https://mediapull.co");
  const [dark, setDark] = useState("#0d7cff");
  const [light, setLight] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!value.trim()) {
        setDataUrl("");
        return;
      }
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(value, { width: size, margin, color: { dark, light }, errorCorrectionLevel: "H" });
      if (!cancelled) setDataUrl(url);
    }
    void render();
    return () => {
      cancelled = true;
    };
  }, [value, dark, light, size, margin]);

  async function download() {
    if (!dataUrl) return;
    downloadBlob(await (await fetch(dataUrl)).blob(), "qr-code.png");
  }

  return (
    <ToolPanel>
      <Field label="Link or text"><input className={inputClass} value={value} onChange={(event) => setValue(event.target.value)} /></Field>
      <Row>
        <Field label="Code colour"><input type="color" value={dark} onChange={(event) => setDark(event.target.value)} className="h-11 w-full rounded-md border border-input bg-background" /></Field>
        <Field label="Background"><input type="color" value={light} onChange={(event) => setLight(event.target.value)} className="h-11 w-full rounded-md border border-input bg-background" /></Field>
        <Field label="Size (px)"><input type="number" min={128} max={2048} step={64} className={inputClass} value={size} onChange={(event) => setSize(Number(event.target.value))} /></Field>
        <Field label={`Quiet border ${margin}`}><input type="range" min={0} max={8} value={margin} onChange={(event) => setMargin(Number(event.target.value))} className="h-11 w-full accent-primary" /></Field>
      </Row>
      {dataUrl ? (
        <div className="mt-8 grid place-items-center rounded-md border border-border bg-background p-8">
          <img src={dataUrl} alt="Your QR code" className="size-56" />
        </div>
      ) : null}
      <Row><ActionButton onClick={download} disabled={!dataUrl}>Download PNG</ActionButton></Row>
      <StatusNote>High error correction is used, so the code still scans if a logo or sticker covers part of it.</StatusNote>
    </ToolPanel>
  );
}
