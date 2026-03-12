import { cn } from "@/lib/utils";

export function PRCCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-prc-surface border border-prc-primary/10 rounded-xl p-4 shadow-card",
        className,
      )}
      {...props}
    />
  );
}
