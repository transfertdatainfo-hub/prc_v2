"use client";

import { useState, useEffect } from "react";
import { Plus, Rss, ExternalLink } from "lucide-react";
import ActualitesFilters from "@/components/prc/news-sections/ActualitesFilters";
import { filterArticles } from "@/lib/filters/newsFilters";
import { Article } from "@/types/Article";
import { RSSFeed } from "@/types/RSSFeed";

export default function RSSReaderPage() {
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Nouveaux filtres
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

  // Charger les articles quand un flux est sélectionné
  useEffect(() => {
    if (selectedFeed) {
      fetchArticles(selectedFeed.url);
    }
  }, [selectedFeed]);

  const fetchFeeds = async () => {
    try {
      const response = await fetch("/api/rss-feeds");
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      console.error("Erreur lors du chargement des flux:", error);
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
        // Afficher le message d'erreur spécifique du serveur
        alert(data.error || "Erreur lors de l'ajout du flux RSS");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
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
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Application du filtre sur les articles
  const applyFilters = (articles: Article[], filters: any) => {
    return filterArticles(articles, filters);
  };

  const filteredArticles = applyFilters(articles, filters);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Section : Barre d'ajout de flux RSS */}
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

      {/* Section : Filtres */}
      <ActualitesFilters filters={filters} setFilters={setFilters} />

      {/* Sections Liste des flux et liste des article */}
      <div className="flex-1 flex overflow-hidden">
        {/* Section : Liste des flux RSS */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
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
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
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

        {/* Section : Articles du flux sélectionné */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedFeed ? `Articles - ${selectedFeed.title}` : "Articles"}
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
            ) : articles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun article disponible
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredArticles.map(
                  (
                    article,
                    index, // Avant était "{articles.map((article, index) => ("
                  ) => (
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
                          )}
                        </span>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          Lire plus
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
