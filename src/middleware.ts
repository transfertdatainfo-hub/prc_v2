// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isPublicPage = req.nextUrl.pathname === "/" || 
                         req.nextUrl.pathname === "/free" ||
                         req.nextUrl.pathname.startsWith("/api/auth");

    // Cas 1: Utilisateur connecté sur une page d'auth (/login, /register, /verify)
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Cas 2: Utilisateur NON connecté sur une page protégée
    if (!isAuth && !isAuthPage && !isPublicPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // On gère la redirection nous-mêmes dans la fonction middleware
        return true;
      },
    },
  }
);

// Configuration des chemins où le middleware s'exécute
export const config = {
  matcher: [
    /*
     * Match tous les chemins sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (images optimisées)
     * - favicon.ico
     * - public (dossier public)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};