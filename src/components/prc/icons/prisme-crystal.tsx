export function LogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
        className="stroke-prc-primary"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="12" cy="12" r="2" className="fill-prc-primary/20" />
    </svg>
  );
}
