import { cn } from "@/lib/utils";

export function Logo({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/logo-tarkam.png"
        alt="Tarkam Logo"
        className={cn("h-8 w-auto object-contain shrink-0", iconClassName)}
      />
    </div>
  );
}
