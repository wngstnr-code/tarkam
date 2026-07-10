import { cn } from "@/lib/utils";

export function Logo({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/logo-tarkam.png"
        alt=""
        className={cn("h-8 w-auto object-contain shrink-0", iconClassName)}
      />
      <span className="font-display leading-none tracking-wide uppercase">
        Tarkam
      </span>
    </div>
  );
}
