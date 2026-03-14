// À placer dans un composant, par exemple components/prc/logo.tsx
export function LogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4H16C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20H4V4Z"
        className="stroke-prc-primary"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8 8H14M8 12H16M8 16H12"
        className="stroke-prc-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="6" r="1.5" className="fill-prc-primary/20" />
    </svg>
  );
}
