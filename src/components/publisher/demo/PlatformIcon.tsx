/**
 * Canonical platform icons for the Publisher demo.
 * Single source of truth — import PlatformIcon everywhere instead of inline SVGs.
 *
 * Usage:
 *   <PlatformIcon platform="facebook" size={20} />
 *   <PlatformIcon platform="instagram" size={32} rounded />
 */

type Platform = "facebook" | "instagram" | "linkedin" | "tiktok";

interface Props {
  platform: Platform;
  /** Icon container size in px (default 20) */
  size?: number;
  /** Extra class names on the wrapper */
  className?: string;
}

// ── Facebook ──────────────────────────────────────────────────────────────────
function Facebook({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.5 8H13.5C13.2239 8 13 8.22386 13 8.5V11H15.5L15.1 13.5H13V20H10.5V13.5H8.5V11H10.5V8.5C10.5 6.84315 11.8431 5.5 13.5 5.5H15.5V8Z"
        fill="white"
      />
    </svg>
  );
}

// ── Instagram ─────────────────────────────────────────────────────────────────
function Instagram({ s }: { s: number }) {
  const id = `ig${s}`;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id={id} cx="30%" cy="107%" r="150%">
          <stop offset="0%"  stopColor="#fdf497" />
          <stop offset="5%"  stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${id})`} />
      <rect x="6" y="6" width="12" height="12" rx="3.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="white" />
    </svg>
  );
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────
function LinkedIn({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        d="M6.5 10H9V18H6.5V10ZM7.75 9C6.92 9 6.25 8.33 6.25 7.5C6.25 6.67 6.92 6 7.75 6C8.58 6 9.25 6.67 9.25 7.5C9.25 8.33 8.58 9 7.75 9Z"
        fill="white"
      />
      <path
        d="M11 10H13.4V11.2H13.43C13.77 10.56 14.6 9.85 15.85 9.85C18.37 9.85 18.85 11.53 18.85 13.7V18H16.35V14.12C16.35 13.22 16.33 12.07 15.08 12.07C13.81 12.07 13.61 13.05 13.61 14.06V18H11.11V10H11Z"
        fill="white"
      />
    </svg>
  );
}

// ── TikTok ────────────────────────────────────────────────────────────────────
function TikTok({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#010101" />
      {/* Cyan shadow */}
      <path
        d="M17.5 8.2A3.8 3.8 0 0 1 13.8 4.5H11.3V14.8C11.28 15.74 10.52 16.5 9.57 16.5C8.61 16.5 7.84 15.73 7.84 14.77C7.84 13.81 8.61 13.04 9.57 13.04C9.76 13.04 9.94 13.07 10.11 13.12V10.55C9.93 10.52 9.75 10.5 9.57 10.5C7.24 10.5 5.34 12.4 5.34 14.73C5.34 17.06 7.24 18.96 9.57 18.96C11.9 18.96 13.8 17.06 13.8 14.73V9.42A6.25 6.25 0 0 0 17.5 10.54V8.2Z"
        fill="#69C9D0"
        opacity="0.6"
      />
      {/* Main white */}
      <path
        d="M16.5 7.2A3.8 3.8 0 0 1 12.8 3.5H10.3V13.8C10.28 14.74 9.52 15.5 8.57 15.5C7.61 15.5 6.84 14.73 6.84 13.77C6.84 12.81 7.61 12.04 8.57 12.04C8.76 12.04 8.94 12.07 9.11 12.12V9.55C8.93 9.52 8.75 9.5 8.57 9.5C6.24 9.5 4.34 11.4 4.34 13.73C4.34 16.06 6.24 17.96 8.57 17.96C10.9 17.96 12.8 16.06 12.8 13.73V8.42A6.25 6.25 0 0 0 16.5 9.54V7.2Z"
        fill="white"
      />
    </svg>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export function PlatformIcon({ platform, size = 20, className = "" }: Props) {
  const el = (() => {
    switch (platform) {
      case "facebook":  return <Facebook  s={size} />;
      case "instagram": return <Instagram s={size} />;
      case "linkedin":  return <LinkedIn  s={size} />;
      case "tiktok":    return <TikTok    s={size} />;
    }
  })();

  return (
    <span className={`inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {el}
    </span>
  );
}

export default PlatformIcon;
