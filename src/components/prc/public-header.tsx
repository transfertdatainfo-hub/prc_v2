//src\components\prc\public-header.tsx

import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="w-full border-b border-prc-primary/10 bg-prc-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="text-prc-primary font-semibold">PRC</span>
        <nav className="flex gap-4 text-sm">
          <Link href="#features">Fonctionnalités</Link>
          <Link href="#pricing">Forfaits</Link>
          <Link href="#scenario">Scénario</Link>
          <Link href="/login" className="text-prc-primary">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}
