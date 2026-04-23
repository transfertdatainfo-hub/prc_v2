"use client";

import { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Toaster position="top-center" />

      {/* ===== TOPBAR ===== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-gray-800">
                PRIVATIS CAPITAL
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== CONTENU ===== */}
      <main className="flex-1 flex items-center justify-center pt-16 pb-12 px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-white text-sm">
                PRIVATIS CAPITAL
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                CGU
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Support
              </Link>
            </div>

            <p className="text-xs text-gray-500">
              © 2025 PRIVATIS CAPITAL. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
