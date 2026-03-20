// src\app\(dashboard)\news\news-sections\FeedsView.tsx

"use client";

import { Article } from "@/types/Article";
import { RSSFeed } from "@/types/RSSFeed";
import {
  Search,
  X,
  Trash2,
  Rss,
  ExternalLink,
  FileText,
  DollarSign,
} from "lucide-react";
import { Filters } from "@/types/Filters";

interface FeedsViewProps {
  feeds: RSSFeed[];
  selectedFeed: RSSFeed | null;
  setSelectedFeed: (feed: RSSFeed | null) => void;
  articles: Article[];
  filteredArticles: Article[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  mediaOptions: { value: string; label: string }[];
  filteredFeedsByMedia: RSSFeed[];
  loadingArticles?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onDeleteFeed: (feedId: string) => void;
  extractMediaName: (title: string) => string;
  extractDomain: (url: string) => string;
}

export default function FeedsView({
  feeds,
  selectedFeed,
  setSelectedFeed,
  articles,
  filteredArticles,
  filters,
  setFilters,
  mediaOptions,
  filteredFeedsByMedia,
  loadingArticles,
  searchQuery,
  setSearchQuery,
  onDeleteFeed,
  extractMediaName,
  extractDomain,
}: FeedsViewProps) {
  return (
    <>
      {/* Colonne de gauche - Liste des flux */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-3 border-b border-gray-200 h-[73px] flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Rss className="w-5 h-5" />
            Mes flux RSS
          </h2>
          {filters.mediaFilter && (
            <p className="text-sm text-blue-600 mt-1 flex items-center gap-2 ml-4">
              <span>
                Filtré par :{" "}
                {
                  mediaOptions.find((m) => m.value === filters.mediaFilter)
                    ?.label
                }
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, mediaFilter: undefined })
                }
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredFeedsByMedia.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {feeds.length === 0
                ? "Aucun flux RSS ajouté"
                : "Aucun flux pour ce média"}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredFeedsByMedia.map((feed) => (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeed(feed)}
                  className={`p-4 rounded-lg cursor-pointer transition-all group ${
                    selectedFeed?.id === feed.id
                      ? "bg-blue-50 border-2 border-blue-300"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3
                      className="font-medium text-gray-800 truncate flex-1 pr-2 text-lg"
                      title={feed.title}
                    >
                      {extractMediaName(feed.title)}
                    </h3>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFeed(feed.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Supprimer ce flux"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {feed.url && (
                    <p
                      className="text-base text-gray-400 truncate mt-1"
                      title={feed.url}
                    >
                      {extractDomain(feed.url)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colonne de droite - Articles du flux sélectionné */}
      <div className="w-[70%] bg-gray-50 flex flex-col">
        <div className="px-6 py-3 bg-white border-b border-gray-200 h-[73px] flex items-center">
          <div className="flex justify-between items-center gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <h2
                className="text-lg font-semibold text-gray-800 truncate"
                title={
                  selectedFeed
                    ? `Articles - ${selectedFeed.title}`
                    : "Sélectionnez un flux"
                }
              >
                {selectedFeed
                  ? `Articles - ${selectedFeed.title}`
                  : "Sélectionnez un flux"}
              </h2>

              {/* Badges des filtres actifs - NOUVEAU */}
              <div className="flex items-center gap-1">
                {filters.showPaywallOnly && (
                  <span
                    className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
                    title="Filtre payant actif"
                  >
                    <DollarSign className="w-3 h-3" />
                  </span>
                )}
                {filters.showContentOnly && (
                  <span
                    className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                    title="Filtre contenu actif"
                  >
                    <FileText className="w-3 h-3" />
                  </span>
                )}
              </div>

              {selectedFeed && filteredArticles.length > 0 && (
                <span className="flex-shrink-0 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {filteredArticles.length}
                </span>
              )}
            </div>

            <div className="relative w-80 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedFeed ? (
            <div className="p-6 text-center text-gray-500">
              Sélectionnez un flux pour voir ses articles
            </div>
          ) : loadingArticles ? (
            <div className="p-6 text-center text-gray-500">
              Chargement des articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun article disponible
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredArticles.map((article, index) => (
                <article
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* En-tête avec le nom du flux ET les badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Nom du flux */}
                    {article.feedTitle && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {extractMediaName(article.feedTitle)}
                      </span>
                    )}

                    {/* Badge CONTENU - si l'article a le contenu complet */}
                    {article.hasFullContent && (
                      <span
                        className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                        title="Contenu complet disponible"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Contenu</span>
                      </span>
                    )}

                    {/* Badge PAYANT - si l'article est payant */}
                    {article.isPaywalled && (
                      <span
                        className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
                        title="Article payant"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Payant</span>
                      </span>
                    )}
                  </div>

                  {/* Titre de l'article */}
                  <h3 className="font-medium text-gray-800 mb-2 text-lg">
                    {article.title}
                  </h3>

                  {/* Description (si existe) */}
                  {article.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {article.description}
                    </p>
                  )}

                  {/* Pied de l'article (date et lien) */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
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
                      Lire plus
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
