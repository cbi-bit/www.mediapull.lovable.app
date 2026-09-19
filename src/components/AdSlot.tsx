import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-1636922398620774";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  /** Ad unit slot ID from the AdSense dashboard. Omitted = Auto Ads placement. */
  slot?: string;
  className?: string;
};

export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded (blocked or offline) — placeholder copy remains.
    }
  }, []);

  return (
    <aside className={`border-t border-border bg-background px-5 py-8 sm:px-8 ${className}`} aria-label="Advertisement">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase text-muted-foreground">Advertisement</p>
        <ins
          className="adsbygoogle block min-h-24 w-full rounded-md border border-dashed border-border bg-card"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">Ad space helps keep MediaPull free.</p>
      </div>
    </aside>
  );
}
