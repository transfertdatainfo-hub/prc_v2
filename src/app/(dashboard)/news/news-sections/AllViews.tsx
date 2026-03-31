// src/app/(dashboard)/news/news-sections/AllViews.tsx

"use client";

import { Article } from "@/types/Article";
import {
  Search,
  X,
  ExternalLink,
  FileText,
  DollarSign,
  Gift,
  RefreshCw,
} from "lucide-react";
import { Filters } from "@/types/Filters";

interface AllViewProps {
  articles: Article[];
  filteredArticles: Article[];
  allArticles: Article[];
  uniqueArticles: Article[];
  loading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters?: Filters;
  onRefresh?: () => void;
}

export default function AllView({
  articles,
  filteredArticles,
  allArticles,
  uniqueArticles,
  loading,
  searchQuery,
  setSearchQuery,
  filters = {
    language: "",
    category: "",
    activeInterestFilters: [],
    showPaywallOnly: false,
    showContentOnly: false,
  },
  onRefresh,
}: AllViewProps) {
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* En-tête avec compteur et information sur les doublons */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            {/* Titre avec bouton Rafraîchir intégré */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                Tous les articles
              </h1>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Rafraîchir les articles"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Rafraîchir</span>
                </button>
              )}
            </div>

            {/* Indicateurs de filtres actifs */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <p className="text-sm text-gray-500">
                {filteredArticles.length} article
                {filteredArticles.length > 1 ? "s" : ""} unique
                {filteredArticles.length > 1 ? "s" : ""}
              </p>

              {filters.showContentOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  <FileText className="w-3 h-3" />
                  Avec contenu
                </span>
              )}

              {filters.showFreeOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  <Gift className="w-3 h-3" />
                  Gratuits
                </span>
              )}

              {filters.showPaywallOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  Payants
                </span>
              )}
            </div>

            {/* Information sur les doublons */}
            {allArticles.length > uniqueArticles.length && (
              <div className="mt-1">
                <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                  {allArticles.length - uniqueArticles.length} doublon
                  {allArticles.length - uniqueArticles.length > 1
                    ? "s"
                    : ""}{" "}
                  supprimé
                  {allArticles.length - uniqueArticles.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* BOUTON RAPPORT ACTUALITÉS - reste à droite */}
          {allArticles.length > 0 && (
            <button
              onClick={() => {
                console.log(
                  "🔍 Génération du rapport avec",
                  filteredArticles.length,
                  "articles",
                );
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Rapport Actualités
            </button>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full group mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans les articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                 transition-all duration-150 text-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Liste des articles - reste inchangée */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement des articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun article disponible
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <article
                key={`${article.feedId}-${article.link}-${index}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* En-tête avec badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {article.feedTitle && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {article.feedTitle}
                    </span>
                  )}
                  {article.hasFullContent && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <FileText className="w-3 h-3" />
                      <span>Contenu</span>
                    </span>
                  )}
                  {article.isPaywalled && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" />
                      <span>Payant</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {article.title}
                </h2>

                {article.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                  </p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                  <span>
                    {new Date(article.pubDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
                  >
                    Lire l&apos;article complet
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
