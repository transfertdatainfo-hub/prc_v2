"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "CredentialsSignin":
        return "Email ou mot de passe incorrect";
      case "AccessDenied":
        return "Accès refusé";
      case "OAuthSignin":
        return "Erreur lors de la connexion OAuth";
      default:
        return "Une erreur est survenue lors de la connexion";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h1>
      <p className="text-gray-500 mb-6">{getErrorMessage()}</p>
      <Link
        href="/auth/login"
        className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
