"use client";

import Link from "next/link";
import { User, HelpCircle, CreditCard, LogOut } from "lucide-react";
import { LogoIcon } from "@/components/prc/icons/eye";

export function Topbar() {
  return (
    <header className="h-14 w-full bg-prc-surface border-b border-prc-primary/10 flex items-center justify-between px-4">
      {/* Logo SVG à gauche */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <LogoIcon className="w-9 h-9 text-prc-primary group-hover:text-prc-primary/80 transition-colors" />
        <span className="text-prc-primary font-semibold tracking-tight hidden sm:inline text-xl">
          PRIVATIS CAPITAL
        </span>
      </Link>

      {/* Boutons à droite AVEC les titres */}
      <nav className="flex items-center gap-1">
        <Link
          href="/profil"
          className="p-2 rounded-md hover:bg-prc-primary/10 relative group"
          title="Profil" // ← Tooltip au survol
        >
          <User className="w-5 h-5 text-prc-text-secondary" />
          <span className="sr-only">Profil</span> {/* ← Pour accessibilité */}
        </Link>

        <Link
          href="/aide"
          className="p-2 rounded-md hover:bg-prc-primary/10 relative group"
          title="Aide"
        >
          <HelpCircle className="w-5 h-5 text-prc-text-secondary" />
          <span className="sr-only">Aide</span>
        </Link>

        <Link
          href="/facturation"
          className="p-2 rounded-md hover:bg-prc-primary/10 relative group"
          title="Facturation"
        >
          <CreditCard className="w-5 h-5 text-prc-text-secondary" />
          <span className="sr-only">Facturation</span>
        </Link>

        <Link
          href="/auth/logout"
          className="p-2 rounded-md hover:bg-prc-primary/10 relative group"
          title="Quitter"
        >
          <LogOut className="w-5 h-5 text-prc-text-secondary hover:text-red-600" />
          <span className="sr-only">Quitter</span>
        </Link>
      </nav>
    </header>
  );
}
