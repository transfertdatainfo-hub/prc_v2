// src/app/(dashboard)/news/page.tsx

"use client";

import { X, Plus, Rss, Newspaper } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Article } from "@/types/Article";
import { Source } from "@/types/Source";
import { RSSFeed } from "@/types/RSSFeed";
import { filterArticles } from "@/lib/filters/newsFilters";
import ActualitesFilters from "./news-sections/ActualitesFilters";
import CategoryView from "./news-sections/CategoryView";
import AllView from "./news-sections/AllViews";
import FeedsView from "./news-sections/FeedsView";
import { InterestFilter } from "@/types/InterestFilter";

type MediaOption = {
  value: string;
  label: string;
};

export default function RSSReaderPage() {
  // ==================== ÉTATS ====================

  // État pour l'ajout de flux
  const [feedUrl, setFeedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // État pour les flux RSS
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);

  // État pour les articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [uniqueArticles, setUniqueArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingAllArticles, setLoadingAllArticles] = useState(false);

  // État pour l'interface
  const [viewMode, setViewMode] = useState<"category" | "all" | "feeds">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // État pour les sources
  const [sources, setSources] = useState<Source[]>([]);

  // État pour les filtres d'intérêts
  const [interestFilters, setInterestFilters] = useState<InterestFilter[]>([]);
  const [preparedFilters, setPreparedFilters] = useState<
    { id: string; keywords: string[] }[]
  >([]);

  // État pour les filtres généraux
  const [filters, setFilters] = useState<{
    language: string;
    category: string;
    sourceId?: string;
    activeInterestFilters: string[];
    showFreeOnly?: boolean;
    showPaywallOnly?: boolean;
    showContentOnly?: boolean;
  }>({
    language: "",
    category: "",
    sourceId: undefined,
    activeInterestFilters: [],
    showFreeOnly: false,
    showPaywallOnly: false,
    showContentOnly: false,
  });

  // ==================== FONCTIONS UTILITAIRES ====================

  // Éliminer les doublons basée sur le titre et la date
  const removeDuplicates = (articles: Article[]): Article[] => {
    const uniqueMap = new Map();

    articles.forEach((article) => {
      const cleanTitle = article.title.trim().toLowerCase();
      const articleDate = new Date(article.pubDate).toLocaleDateString();
      const key = `${cleanTitle}-${articleDate}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, article);
      } else {
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

  // Transforme les InterestFilter en format simple pour le filtrage
  const prepareFiltersForEngine = (filters: InterestFilter[]) => {
    return filters.map((filter) => ({
      id: filter.id,
      keywords: filter.keywords.map((k) => k.word),
    }));
  };

  // Extraire le domaine de l'URL
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url;
    }
  };

  // Extraire le nom du média à partir du titre du flux (fallback)
  const extractMediaName = (title: string): string => {
    const feed = feeds.find((f) => f.title === title);
    return feed?.source?.name || title.split(" | ")[0];
  };

  // ==================== FONCTIONS DE CHARGEMENT ====================

  // Charger les sources depuis la base de données
  const fetchSources = async () => {
    try {
      const response = await fetch("/api/sources");
      const data = await response.json();
      setSources(data);
      console.log("✅ Sources chargées:", data.length);
    } catch (error) {
      console.error("Erreur chargement sources:", error);
    }
  };

  // Charger les filtres d'intérêts
  const fetchInterestFilters = async () => {
    try {
      const response = await fetch("/api/interest-filters");
      const data = await response.json();
      setInterestFilters(data);
      setPreparedFilters(prepareFiltersForEngine(data));
      console.log("✅ Filtres d'intérêts chargés:", data.length);
    } catch (error) {
      console.error("Erreur chargement filtres intérêts:", error);
    }
  };

  // Charger les flux RSS
  const fetchFeeds = async () => {
    try {
      const response = await fetch("/api/rss-feeds");
      const data = await response.json();
      setFeeds(data);
      console.log("✅ Flux chargés:", data.length);
    } catch (error) {
      console.error("Erreur lors du chargement des flux:", error);
    }
  };

  // Charger les articles d'un flux spécifique
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

  // Charger tous les articles de tous les flux
  const fetchAllArticles = useCallback(async () => {
    if (feeds.length === 0) {
      setAllArticles([]);
      setUniqueArticles([]);
      return;
    }

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
              feedSourceId: feed.sourceId,
            })),
          ),
      );

      const articlesArrays = await Promise.all(articlesPromises);
      const allArticlesFlattened = articlesArrays.flat();

      const sortedArticles = allArticlesFlattened.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );

      setAllArticles(sortedArticles);
      const unique = removeDuplicates(sortedArticles);
      setUniqueArticles(unique);

      console.log("✅ Articles chargés:", {
        total: sortedArticles.length,
        uniques: unique.length,
      });
    } catch (error) {
      console.error("Erreur lors du chargement de tous les articles:", error);
      setAllArticles([]);
      setUniqueArticles([]);
    } finally {
      setLoadingAllArticles(false);
    }
  }, [feeds]);

  // ==================== FONCTIONS DE GESTION DES FLUX ====================

  // Ajouter un nouveau flux
  /*const addFeed = async () => {
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
        console.log("✅ Flux ajouté avec source:", data.source?.name);
      } else {
        alert(data.error || "Erreur lors de l'ajout du flux RSS");
        setFeedUrl("");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
      setFeedUrl("");
    } finally {
      setLoading(false);
    }
  };*/
  // src/app/(dashboard)/news/page.tsx

  // Ajouter un nouveau flux
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

        // 👇 AJOUTER CETTE LIGNE : Recharger les sources
        await fetchSources();

        console.log("✅ Flux ajouté avec source:", data.source?.name);
      } else {
        alert(data.error || "Erreur lors de l'ajout du flux RSS");
        setFeedUrl("");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
      setFeedUrl("");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un flux
  const deleteFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/rss-feeds/${feedId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedFeeds = feeds.filter((f) => f.id !== feedId);
        setFeeds(updatedFeeds);

        if (selectedFeed?.id === feedId) {
          setSelectedFeed(null);
          setArticles([]);
        }

        await fetchSources();

        if (viewMode === "all" || viewMode === "category") {
          if (updatedFeeds.length === 0) {
            setAllArticles([]);
            setUniqueArticles([]);
          } else {
            await fetchAllArticles();
          }
        } else if (viewMode === "feeds") {
          if (updatedFeeds.length === 0) {
            setAllArticles([]);
            setUniqueArticles([]);
          } else {
            await fetchAllArticles();
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // ==================== FONCTIONS DE FILTRAGE ====================

  // Appliquer tous les filtres (langue, catégorie, intérêts, etc.)
  const applyFilters = useCallback(
    (articles: Article[], filters: any) => {
      return filterArticles(articles, filters, preparedFilters);
    },
    [preparedFilters],
  );

  // Filtre de recherche
  const searchFilter = useCallback(
    (text: string) => {
      if (!searchQuery.trim()) return true;
      const t = searchQuery.toLowerCase();
      return text.toLowerCase().includes(t);
    },
    [searchQuery],
  );

  // ==================== DONNÉES CALCULÉES ====================

  // Transformer les sources en options pour le filtre média
  const mediaOptions: MediaOption[] = useMemo(() => {
    console.log("📊 Calcul de mediaOptions avec sources:", sources.length);
    return sources.map((source) => ({
      value: source.id,
      label: source.name,
    }));
  }, [sources]);

  // Flux filtrés par source (pour le mode feeds)
  const filteredFeedsBySource = useMemo(() => {
    return filters.sourceId
      ? feeds.filter((feed) => feed.sourceId === filters.sourceId)
      : feeds;
  }, [feeds, filters.sourceId]);

  // Articles à afficher selon le mode
  const articlesToDisplay = useMemo(() => {
    if (viewMode === "category" || viewMode === "all") {
      let baseArticles = uniqueArticles;

      if (filters.sourceId) {
        baseArticles = baseArticles.filter((article) => {
          const feed = feeds.find((f) => f.id === article.feedId);
          return feed?.sourceId === filters.sourceId;
        });
      }
      return baseArticles;
    }
    return articles;
  }, [viewMode, uniqueArticles, articles, feeds, filters.sourceId]);

  // Articles filtrés (recherche + autres filtres)
  const filteredArticles = useMemo(() => {
    const withFilters = applyFilters(articlesToDisplay, filters);
    const withSearch = withFilters.filter(
      (a) => searchFilter(a.title) || searchFilter(a.description || ""),
    );
    return withSearch;
  }, [articlesToDisplay, filters, applyFilters, searchFilter]);

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

  // Générer un rapport
  const handleGenerateReport = useCallback(() => {
    console.log(
      "🚀 Génération du rapport avec",
      filteredArticles.length,
      "articles",
    );
    // TODO: Implémenter la génération réelle
  }, [filteredArticles]);

  // ==================== EFFETS ====================

  // Chargement initial
  useEffect(() => {
    console.log("🔄 Chargement initial des données");
    fetchFeeds();
    fetchSources();
    fetchInterestFilters();
  }, []);

  // Recharger tous les articles quand les flux changent
  useEffect(() => {
    if ((viewMode === "all" || viewMode === "category") && feeds.length > 0) {
      fetchAllArticles();
    }
  }, [viewMode, feeds, fetchAllArticles]);

  // Charger les articles d'un flux spécifique
  useEffect(() => {
    if (viewMode === "feeds" && selectedFeed) {
      fetchArticles(selectedFeed.url);
    }
  }, [viewMode, selectedFeed]);

  // Réinitialiser le flux sélectionné quand le filtre source change
  useEffect(() => {
    if (viewMode === "feeds") {
      setSelectedFeed(null);
      setArticles([]);
    }
  }, [filters.sourceId, viewMode]);

  // Sélectionner automatiquement le premier flux
  useEffect(() => {
    if (viewMode === "feeds") {
      if (filteredFeedsBySource.length > 0 && !selectedFeed) {
        setSelectedFeed(filteredFeedsBySource[0]);
      }

      if (selectedFeed && filteredFeedsBySource.length > 0) {
        const stillExists = filteredFeedsBySource.some(
          (feed) => feed.id === selectedFeed.id,
        );
        if (!stillExists) {
          setSelectedFeed(filteredFeedsBySource[0]);
        }
      }
    }
  }, [viewMode, filteredFeedsBySource, selectedFeed]);

  // ==================== RENDU JSX ====================

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Barre d'ajout de flux RSS */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFeed()}
              placeholder="Entrez l'URL d'un flux RSS..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
            />
            {feedUrl && (
              <button
                onClick={() => setFeedUrl("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
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
                <Rss className="w-4 h-4" />
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

            <button
              onClick={() => {
                setViewMode("category");
                setSelectedFeed(null);
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                viewMode === "category"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Par catégorie
              </span>
              {viewMode === "category" && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <ActualitesFilters
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        mediaOptions={mediaOptions}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "feeds" ? (
          <FeedsView
            feeds={feeds}
            selectedFeed={selectedFeed}
            setSelectedFeed={setSelectedFeed}
            articles={articles}
            filteredArticles={filteredArticles}
            filters={filters}
            setFilters={setFilters}
            mediaOptions={mediaOptions}
            filteredFeedsByMedia={filteredFeedsBySource}
            loadingArticles={loadingArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteFeed={deleteFeed}
            extractMediaName={extractMediaName}
            extractDomain={extractDomain}
            onGenerateReport={handleGenerateReport}
          />
        ) : viewMode === "category" ? (
          <CategoryView
            articles={filteredArticles}
            filters={filters}
            loading={loadingAllArticles}
          />
        ) : (
          <AllView
            articles={articles}
            filteredArticles={filteredArticles}
            allArticles={allArticles}
            uniqueArticles={uniqueArticles}
            loading={loadingAllArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
          />
        )}
      </div>
    </div>
  );
}
