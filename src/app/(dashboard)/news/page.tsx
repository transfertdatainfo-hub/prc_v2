"use client";

import { useState, useEffect } from "react";
import { Plus, Rss, ExternalLink, Newspaper } from "lucide-react";
import { Article } from "@/types/Article";
import { RSSFeed } from "@/types/RSSFeed";
import { filterArticles } from "@/lib/filters/newsFilters";

import ActualitesFilters from "./news-sections/ActualitesFilters";

export default function RSSReaderPage() {
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [uniqueArticles, setUniqueArticles] = useState<Article[]>([]); // Nouvel état pour les articles uniques
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingAllArticles, setLoadingAllArticles] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "feeds">("all");

  const [filters, setFilters] = useState({
    language: "",
    category: "",
    canada: false,
    quebec: false,
    tunisia: false,
    portfolio: false,
  });

  // Charger les flux RSS au démarrage
  useEffect(() => {
    fetchFeeds();
  }, []);

  // Charger tous les articles quand on est en mode "all"
  useEffect(() => {
    if (viewMode === "all" && feeds.length > 0) {
      fetchAllArticles();
    }
  }, [viewMode, feeds]);

  // Charger les articles d'un flux spécifique
  useEffect(() => {
    if (viewMode === "feeds" && selectedFeed) {
      fetchArticles(selectedFeed.url);
    }
  }, [viewMode, selectedFeed]);

  // Fonction pour éliminer les doublons basée sur le titre et la date
  const removeDuplicates = (articles: Article[]): Article[] => {
    const uniqueMap = new Map();

    articles.forEach((article) => {
      // Créer une clé unique basée sur le titre et la date (pour éviter les faux doublons)
      // On nettoie le titre et on prend la date sans l'heure pour comparer
      const cleanTitle = article.title.trim().toLowerCase();
      const articleDate = new Date(article.pubDate).toLocaleDateString();
      const key = `${cleanTitle}-${articleDate}`;

      // Si l'article n'existe pas encore dans la Map, ou si celui-ci a une meilleure description
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, article);
      } else {
        // Optionnel : Garder l'article avec la description la plus complète
        const existing = uniqueMap.get(key);
        if (
          article.description &&
          (!existing.description ||
            article.description.length > existing.description.length)
        ) {
          uniqueMap.set(key, article);
        }
      }
    });

    return Array.from(uniqueMap.values());
  };

  const fetchFeeds = async () => {
    try {
      const response = await fetch("/api/rss-feeds");
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      console.error("Erreur lors du chargement des flux:", error);
    }
  };

  const fetchAllArticles = async () => {
    setLoadingAllArticles(true);
    try {
      const articlesPromises = feeds.map((feed) =>
        fetch(`/api/rss-feeds/articles?url=${encodeURIComponent(feed.url)}`)
          .then((res) => res.json())
          .then((articles) =>
            articles.map((article: Article) => ({
              ...article,
              feedTitle: feed.title,
              feedId: feed.id,
            })),
          ),
      );

      const articlesArrays = await Promise.all(articlesPromises);
      const allArticlesFlattened = articlesArrays.flat();

      // Trier par date (du plus récent au plus ancien)
      const sortedArticles = allArticlesFlattened.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );

      setAllArticles(sortedArticles);

      // Éliminer les doublons
      const unique = removeDuplicates(sortedArticles);
      setUniqueArticles(unique);
    } catch (error) {
      console.error("Erreur lors du chargement de tous les articles:", error);
      setAllArticles([]);
      setUniqueArticles([]);
    } finally {
      setLoadingAllArticles(false);
    }
  };

  const fetchArticles = async (feedUrl: string) => {
    setLoadingArticles(true);
    try {
      const response = await fetch(
        `/api/rss-feeds/articles?url=${encodeURIComponent(feedUrl)}`,
      );
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  };

  const addFeed = async () => {
    if (!feedUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/rss-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeeds([...feeds, data]);
        setFeedUrl("");
      } else {
        alert(data.error || "Erreur lors de l'ajout du flux RSS");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/rss-feeds/${feedId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFeeds(feeds.filter((f) => f.id !== feedId));
        if (selectedFeed?.id === feedId) {
          setSelectedFeed(null);
          setArticles([]);
        }
        if (viewMode === "all") {
          fetchAllArticles();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const applyFilters = (articles: Article[], filters: any) => {
    return filterArticles(articles, filters);
  };

  // Articles filtrés selon le mode
  const filteredArticles =
    viewMode === "all"
      ? applyFilters(uniqueArticles, filters) // Utiliser uniqueArticles au lieu de allArticles
      : applyFilters(articles, filters);

  // Statistiques pour l'affichage (avec les doublons pour les stats)
  const getFeedStats = (feedId: string) => {
    const totalWithDuplicates = allArticles.filter(
      (a) => a.feedId === feedId,
    ).length;
    const uniqueFromFeed = uniqueArticles.filter(
      (a) => a.feedId === feedId,
    ).length;
    const filteredUnique = filteredArticles.filter(
      (a) => a.feedId === feedId,
    ).length;

    return {
      total: totalWithDuplicates,
      unique: uniqueFromFeed,
      filtered: filteredUnique,
    };
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Barre d'ajout de flux RSS */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-3">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFeed()}
            placeholder="Entrez l'URL d'un flux RSS..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={addFeed}
            disabled={loading || !feedUrl.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Tabs design */}
      <div className="bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setViewMode("all");
                setSelectedFeed(null);
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                viewMode === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Tous les articles
              </span>
              {viewMode === "all" && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setViewMode("feeds")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                viewMode === "feeds"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Rss className="w-4 h-4" />
                Par flux RSS
              </span>
              {viewMode === "feeds" && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <ActualitesFilters filters={filters} setFilters={setFilters} />

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "feeds" ? (
          /* Mode "Par flux" : Deux colonnes */
          <>
            {/* Colonne de gauche - Liste des flux (largueur 30%)*/}
            <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Rss className="w-5 h-5" />
                  Mes flux RSS
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {feeds.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Aucun flux RSS ajouté
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {feeds.map((feed) => (
                      <div
                        key={feed.id}
                        onClick={() => setSelectedFeed(feed)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedFeed?.id === feed.id
                            ? "bg-blue-50 border-2 border-blue-300"
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">
                              {feed.title}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {feed.url}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFeed(feed.id);
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne de droite - Articles du flux sélectionné */}
            <div className="w-[70%] bg-gray-50 flex flex-col">
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedFeed
                    ? `Articles - ${selectedFeed.title}`
                    : "Sélectionnez un flux"}
                </h2>
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
                        <h3 className="font-medium text-gray-800 mb-2">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            {new Date(article.pubDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
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
        ) : (
          /* Mode "Tous les articles" : Une seule colonne centrée SANS DOUBLONS */
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
                      {allArticles.length - uniqueArticles.length > 1
                        ? "s"
                        : ""}{" "}
                      supprimé
                      {allArticles.length - uniqueArticles.length > 1
                        ? "s"
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Liste des articles uniques */}
              {loadingAllArticles ? (
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
                          {new Date(article.pubDate).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
                        >
                          Lire l'article complet
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
