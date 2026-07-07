import { cn } from "@/lib/utils";

/** Ikon bola sepak (seam klasik) — monokrom pakai currentColor, tanpa dependensi. */
export function SoccerBall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9.5" />
      {/* pentagon tengah terisi */}
      <path
        d="M12 7.2 16.3 10.3 14.6 15.4 9.4 15.4 7.7 10.3Z"
        fill="currentColor"
        stroke="none"
      />
      {/* seam dari tiap sudut pentagon ke tepi bola */}
      <path d="M12 7.2V2.5M16.3 10.3 20.8 8.9M14.6 15.4 17.4 19.8M9.4 15.4 6.6 19.8M7.7 10.3 3.2 8.9" />
    </svg>
  );
}

/** Wordmark Tarkam ala Stitch: bola sepak + "TARKAM" tebal (Anton) merah. */
export function Logo({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-2 text-2xl tracking-wide text-primary uppercase",
        className
      )}
    >
      <SoccerBall className={cn("size-6 shrink-0", iconClassName)} />
      Tarkam
    </span>
  );
}
