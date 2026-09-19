type MediaPullBrandProps = {
  compact?: boolean;
  className?: string;
};

export function MediaPullBrand({ compact = false, className = "" }: MediaPullBrandProps) {
  return (
    <svg
      className={className}
      viewBox={compact ? "0 0 64 64" : "0 0 292 64"}
      role="img"
      aria-label="MediaPull.co"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mediapull-ring" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-electric)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
        <linearGradient id="mediapull-arrow" x1="23" y1="20" x2="43" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-highlight)" />
          <stop offset="1" stopColor="var(--brand-electric)" />
        </linearGradient>
        <filter id="mediapull-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g aria-hidden="true">
        <circle cx="32" cy="32" r="23.5" fill="none" stroke="var(--brand-ring-dim)" strokeWidth="2" />
        <path
          d="M32 8.5a23.5 23.5 0 1 1-16.62 6.88"
          fill="none"
          stroke="url(#mediapull-ring)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#mediapull-glow)"
        />
        <path d="M20.5 22.5h9.2v17.1l-4.6 6.1-4.6-6.1V22.5Z" fill="url(#mediapull-arrow)" />
        <path d="M34.3 18.5h9.2v21.1l-4.6 6.1-4.6-6.1V18.5Z" fill="url(#mediapull-arrow)" opacity=".78" />
        <path d="m18.4 22.5 6.7-5.3 6.7 5.3H18.4Zm13.8-4 6.7-5.3 6.7 5.3H32.2Z" fill="var(--brand-surface)" />
      </g>

      {!compact && (
        <g aria-hidden="true" fontFamily="var(--font-brand)" letterSpacing="0">
          <text x="74" y="41" fill="var(--brand-text)" fontSize="30" fontWeight="600">Media</text>
          <text x="166" y="41" fill="var(--brand-electric)" fontSize="30" fontWeight="800">Pull</text>
          <text x="227" y="42" fill="var(--brand-muted)" fontSize="14" fontWeight="600">.co</text>
        </g>
      )}
    </svg>
  );
}