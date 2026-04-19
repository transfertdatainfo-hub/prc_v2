// src\components\prc\tag.tsx

import { cn } from "@/lib/utils";

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "error" | "info";
};

export function PRCTag({ variant = "info", className, ...props }: TagProps) {
  const variants = {
    success: "bg-prc-success/20 text-prc-success",
    warning: "bg-prc-warning/20 text-prc-warning",
    error: "bg-prc-error/20 text-prc-error",
    info: "bg-prc-accent/20 text-prc-accent",
  };

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-md",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
