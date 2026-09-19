import { Link } from "@tanstack/react-router";
import { MediaPullBrand } from "./MediaPullBrand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-icon-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link to="/" aria-label="MediaPull.co home" className="inline-block"><MediaPullBrand className="h-10 w-auto" /></Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">A free tool for finding downloadable formats from public media and document links.</p>
          <p className="mt-2 text-xs text-muted-foreground">Supported by clearly labeled advertising from Google AdSense or other providers.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <Link to="/privacy" className="transition hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="transition hover:text-foreground">Terms of Service</Link>
          <span>© {new Date().getFullYear()} MediaPull.co</span>
        </div>
      </div>
    </footer>
  );
}