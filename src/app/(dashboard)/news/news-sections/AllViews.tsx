"use client";

import { Article } from "@/types/Article";
import { Search, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface AllViewProps {
  articles: Article[];
  filteredArticles: Article[];
  allArticles: Article[];
  uniqueArticles: Article[];
  loading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function AllView({
  articles,
  filteredArticles,
  allArticles,
  uniqueArticles,
  loading,
  searchQuery,
  setSearchQuery,
}: AllViewProps) {
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* En-tête avec compteur et information sur les doublons */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Tous les articles
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">
              {filteredArticles.length} article
              {filteredArticles.length > 1 ? "s" : ""} unique
              {filteredArticles.length > 1 ? "s" : ""}
            </p>
            {allArticles.length > uniqueArticles.length && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                {allArticles.length - uniqueArticles.length} doublon
                {allArticles.length - uniqueArticles.length > 1 ? "s" : ""}{" "}
                supprimé
                {allArticles.length - uniqueArticles.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
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
                 transition-all duration-150"
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

        {/* Liste des articles uniques */}
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
                {article.feedTitle && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {article.feedTitle}
                    </span>
                  </div>
                )}
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
