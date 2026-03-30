// src/app/(dashboard)/news/news-sections/CategoryArticles.tsx

"use client";

import { Article } from "@/types/Article";
import { CategoryNode } from "@/types/CategoryNode";
import {
  ExternalLink,
  FileText,
  DollarSign,
  Gift,
  X,
  Search,
  Newspaper,
} from "lucide-react";
import { useState } from "react";

interface CategoryArticlesProps {
  selectedNode: CategoryNode | null;
  articles: Article[];
  loading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CategoryArticles({
  selectedNode,
  articles,
  loading,
  searchQuery,
  setSearchQuery,
}: CategoryArticlesProps) {
  const [localSearch, setLocalSearch] = useState("");

  const filteredArticles = articles.filter((article) => {
    if (!localSearch.trim()) return true;
    const searchLower = localSearch.toLowerCase();
    return (
      article.title.toLowerCase().includes(searchLower) ||
      (article.description &&
        article.description.toLowerCase().includes(searchLower))
    );
  });

  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Sélectionnez une catégorie ou un flux</p>
          <p className="text-sm mt-2">Pour voir les articles correspondants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedNode.title}
              </h1>
              {selectedNode.nodeType === "category" &&
                selectedNode.children.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedNode.children.length} sous-catégorie(s)
                  </p>
                )}
              {selectedNode.url && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Flux: {selectedNode.url}
                </p>
              )}
            </div>

            {/* Badge nombre d'articles */}
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {filteredArticles.length} article
              {filteredArticles.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans les articles..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Liste des articles */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement des articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun article disponible</p>
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <article
                key={`${article.feedId}-${article.link}-${index}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* Badges */}
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
                  {article.isPaywalled ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" />
                      <span>Payant</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      <Gift className="w-3 h-3" />
                      <span>Gratuit</span>
                    </span>
                  )}
                </div>

                {/* Titre */}
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {article.title}
                </h2>

                {/* Description */}
                {article.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                  </p>
                )}

                {/* Pied */}
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
