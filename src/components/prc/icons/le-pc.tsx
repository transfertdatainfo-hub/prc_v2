export function LogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        className="stroke-prc-primary"
        strokeWidth="1.5"
        fill="none"
      />
      <text
        x="7"
        y="17"
        className="fill-prc-primary font-bold text-xs"
        fontFamily="sans-serif"
      >
        PC
      </text>
    </svg>
  );
}
