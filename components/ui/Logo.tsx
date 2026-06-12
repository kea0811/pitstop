/**
 * The Vault emblem — a bat silhouette in the accent colour inside a ringed
 * badge. Pure inline SVG, no asset dependency. Decorative; hidden from a11y
 * (the wordmark beside it carries the name).
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-full border-2 border-accent bg-black ${className}`}
    >
      <svg viewBox="0 0 100 48" className="h-1/2 w-3/5 fill-accent" role="presentation">
        {/* Stylised bat silhouette */}
        <path d="M50 6c-3 0-5 4-5 9-4-6-10-9-17-9-3 6-2 10 1 13-4-1-8 0-11 2 4 1 7 3 9 6-3 0-6 2-8 5 8-2 14 0 18 5 1-5 3-8 7-9-1 4-1 7 1 10 2-3 3-6 5-7 2 1 3 4 5 7 2-3 2-6 1-10 4 1 6 4 7 9 4-5 10-7 18-5-2-3-5-5-8-5 2-3 5-5 9-6-3-2-7-3-11-2 3-3 4-7 1-13-7 0-13 3-17 9 0-5-2-9-5-9z" />
      </svg>
    </span>
  );
}
