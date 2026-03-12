import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function PRCButton({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-medium transition";
  const variants = {
    primary: "bg-prc-primary text-prc-background hover:bg-prc-primaryDark",
    secondary: "bg-prc-surface text-prc-text hover:bg-prc-primary/20",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
