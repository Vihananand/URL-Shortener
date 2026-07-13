import { cn } from "@/lib/utils";
type BadgeVariant = "active" | "inactive" | "info" | "warning";
interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}
const variantClasses: Record<BadgeVariant, string> = {
  active:
    "bg-green-500/15 text-green-500 border border-green-500/30",
  inactive:
    "bg-red-500/15 text-red-500 border border-red-500/30",
  info:
    "bg-primary/15 text-primary border border-primary/30",
  warning:
    "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
};
export default function Badge({
  variant = "info",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "active" ? "bg-green-500" : "",
          variant === "inactive" ? "bg-red-500" : "",
          variant === "info" ? "bg-primary" : "",
          variant === "warning" ? "bg-yellow-400" : ""
        )}
      />
      {children}
    </span>
  );
}
