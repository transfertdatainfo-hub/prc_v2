"use client";

import { useEffect, useState } from "react";

export function LogoIcon({ className = "w-8 h-8" }) {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200); // Cligne pendant 200ms
    }, 3000); // Toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Prisme extérieur */}
      <path
        d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
        className="stroke-prc-primary"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Œil normal */}
      <g style={{ opacity: isBlinking ? 0 : 1, transition: "opacity 0.1s" }}>
        {/* Contour de l'œil */}
        <ellipse
          cx="12"
          cy="12"
          rx="3"
          ry="2.5"
          className="fill-white stroke-prc-primary/30"
          strokeWidth="0.5"
        />
        <circle cx="12" cy="12" r="1.5" className="fill-prc-primary" />
        <circle cx="12" cy="12" r="0.8" className="fill-black" />
        <circle cx="12.7" cy="11.3" r="0.3" fill="white" />
      </g>

      {/* Œil fermé (paupière) - apparaît pendant le clignement */}
      {isBlinking && (
        <path
          d="M8 12Q12 13, 16 12"
          className="stroke-prc-primary stroke-2"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}
