"use client";

import {
  X,
  Search,
  Trash2,
  Plus,
  Rss,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Article } from "@/types/Article";
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
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [uniqueArticles, setUniqueArticles] = useState<Article[]>([]); // Nouvel état pour les articles uniques
  const [loading, setLoading] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingAllArticles, setLoadingAllArticles] = useState(false);
  const [viewMode, setViewMode] = useState<"category" | "all" | "feeds">(
    "category",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([]);
  const [interestFilters, setInterestFilters] = useState<InterestFilter[]>([]);
  const [preparedFilters, setPreparedFilters] = useState<
    { id: string; keywords: string[] }[]
  >([]);

  //const router = useRouter();

  const [filters, setFilters] = useState<{
    language: string;
    category: string;
    mediaFilter?: string;
    activeInterestFilters: string[];
  }>({
    language: "",
    category: "",
    mediaFilter: undefined,
    activeInterestFilters: [],
  });

  const fetchInterestFilters = async () => {
    try {
      const response = await fetch("/api/interest-filters");
      const data = await response.json();
      setInterestFilters(data); // Garde les données complètes si besoin ailleurs
      setPreparedFilters(prepareFiltersForEngine(data)); // ✅ Nouvel état pour le moteur
    } catch (error) {
      console.error("Erreur chargement filtres intérêts:", error);
    }
  };

  const fetchAllArticles = useCallback(async () => {
    setLoadingAllArticles(true);
    try {
      const articlesPromises = feeds.map((feed) =>
        fetch(`/api/rss-feeds/articles?url=${encodeURIComponent(feed.url)}`)
          .then((res) => res.json())
          .then((articles) =>
            articles.map((article: Article) => ({
              ...article, // ✅ Les champs hasFullContent et isPaywalled sont déjà inclus !
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
  }, [feeds]); // ⚠️ IMPORTANT: cette dépendance [feeds] est cruciale

  useEffect(() => {
    console.log("📊 Premier article enrichi:", uniqueArticles[0]);
  }, [uniqueArticles]);

  // Charger les flux RSS au démarrage
  useEffect(() => {
    fetchFeeds();
  }, []);

  useEffect(() => {
    fetchInterestFilters();
  }, []);

  // Charger tous les articles quand on est en mode "all"
  useEffect(() => {
    if ((viewMode === "all" || viewMode === "category") && feeds.length > 0) {
      fetchAllArticles();
    }
  }, [viewMode, feeds]);

  // Charger les articles d'un flux spécifique
  useEffect(() => {
    if (viewMode === "feeds" && selectedFeed) {
      fetchArticles(selectedFeed.url);
    }
  }, [viewMode, selectedFeed]);

  // EXTRAIRE LES MÉDIAS UNIQUES DES FEEDS
  useEffect(() => {
    if (feeds.length > 0) {
      console.log("🔍 Feeds reçus:", feeds);

      const uniqueMedia = new Map<string, MediaOption>();

      feeds.forEach((feed) => {
        try {
          const url = new URL(feed.url);
          const domain = url.hostname.replace("www.", "");
          console.log(`📌 Feed: ${feed.title} | Domaine: ${domain}`);

          if (!uniqueMedia.has(domain)) {
            // Extraire un nom de média plus lisible depuis le titre
            let mediaName = feed.title;
            if (mediaName.includes(" | ")) {
              mediaName = mediaName.split(" | ")[0];
            } else if (mediaName.includes(" - ")) {
              mediaName = mediaName.split(" - ")[0];
            } else if (mediaName.includes(":")) {
              mediaName = mediaName.split(":")[0];
            }

            uniqueMedia.set(domain, {
              value: domain,
              label: mediaName.trim() || domain,
            });
          }
        } catch (e) {
          console.error("❌ Erreur URL pour feed:", feed.url, e);
        }
      });

      setMediaOptions(Array.from(uniqueMedia.values()));
    }
  }, [feeds]);

  // RÉINITIALISER LE FLUX SÉLECTIONNÉ QUAND LE FILTRE MÉDIA CHANGE
  useEffect(() => {
    if (viewMode === "feeds") {
      console.log("🔄 Filtre média changé, réinitialisation");
      setSelectedFeed(null); // On met à null pour déclencher la sélection auto
      setArticles([]);
    }
  }, [filters.mediaFilter, viewMode]);

  // Transforme les InterestFilter (avec Keyword[]) en format simple pour le filtrage
  const prepareFiltersForEngine = (filters: InterestFilter[]) => {
    return filters.map((filter) => ({
      id: filter.id,
      keywords: filter.keywords.map((k) => k.word), // ✅ Ne garde que les mots
    }));
  };

  // FEEDS FILTRÉS PAR MÉDIA (pour le mode feeds)
  const filteredFeedsByMedia = filters.mediaFilter
    ? feeds.filter((feed) => {
        try {
          const url = new URL(feed.url);
          const domain = url.hostname.replace("www.", "");
          const matches = domain === filters.mediaFilter;
          console.log(
            `📊 Feed: ${feed.title} | Domaine: ${domain} | Match: ${matches}`,
          );

          return matches;
        } catch {
          console.log(`❌ Erreur parsing URL: ${feed.url}`);
          return false;
        }
      })
    : feeds;

  // SÉLECTIONNER LE PREMIER FLUX AUTOMATIQUEMENT
  useEffect(() => {
    // Uniquement en mode feeds
    if (viewMode === "feeds") {
      console.log("🔄 Vérification pour sélection automatique");
      console.log("filteredFeedsByMedia:", filteredFeedsByMedia.length);
      console.log("selectedFeed actuel:", selectedFeed?.title);

      // Si on a des flux filtrés ET qu'aucun flux n'est sélectionné
      if (filteredFeedsByMedia.length > 0 && !selectedFeed) {
        console.log(
          "✅ Sélection automatique du premier flux:",
          filteredFeedsByMedia[0].title,
        );
        setSelectedFeed(filteredFeedsByMedia[0]);
      }

      // Si le flux actuellement sélectionné n'est plus dans la liste filtrée
      if (selectedFeed && filteredFeedsByMedia.length > 0) {
        const stillExists = filteredFeedsByMedia.some(
          (feed) => feed.id === selectedFeed.id,
        );
        if (!stillExists) {
          console.log(
            "🔄 Flux sélectionné non disponible, sélection du premier",
          );
          setSelectedFeed(filteredFeedsByMedia[0]);
        }
      }
    }
  }, [viewMode, filteredFeedsByMedia, selectedFeed]);

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

  const fetchArticles = async (feedUrl: string) => {
    setLoadingArticles(true);
    try {
      const response = await fetch(
        `/api/rss-feeds/articles?url=${encodeURIComponent(feedUrl)}`,
      );
      const data = await response.json();
      setArticles(data); // ✅ Les données sont déjà enrichies par l'API
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
    return filterArticles(articles, filters, preparedFilters); // ✅ Utilise preparedFilters
  };

  // Articles filtrés selon le mode
  const searchFilter = (text: string) => {
    if (!searchQuery.trim()) return true;
    const t = searchQuery.toLowerCase();
    return text.toLowerCase().includes(t);
  };

  // ARTICLES À AFFICHER SELON LE MODE
  const articlesToDisplay = useMemo(() => {
    console.log("🔄 Calcul de articlesToDisplay");
    console.log("viewMode:", viewMode);
    console.log("filters.mediaFilter:", filters.mediaFilter);
    console.log("selectedFeed:", selectedFeed?.title);

    // Mode "category" et "all" : on prend uniqueArticles filtrés par média
    if (viewMode === "category" || viewMode === "all") {
      let baseArticles = uniqueArticles;

      // Filtrer par média si nécessaire
      if (filters.mediaFilter) {
        baseArticles = baseArticles.filter((article) => {
          if (article.feedId) {
            const feed = feeds.find((f) => f.id === article.feedId);
            if (feed) {
              try {
                const url = new URL(feed.url);
                const domain = url.hostname.replace("www.", "");
                return domain === filters.mediaFilter;
              } catch {
                return false;
              }
            }
          }
          return false;
        });
      }
      return baseArticles;
    }

    // Mode "feeds" : on retourne les articles du flux sélectionné
    return articles;
  }, [
    viewMode,
    uniqueArticles,
    articles,
    feeds,
    filters.mediaFilter,
    selectedFeed,
  ]);

  // ARTICLES FILTRÉS (recherche + autres filtres)
  const filteredArticles = useMemo(() => {
    console.log(
      "🔍 filteredArticles avec",
      articlesToDisplay.length,
      "articles de base",
    );

    // Appliquer les filtres (langue, catégorie, intérêts) et la recherche
    const withFilters = applyFilters(articlesToDisplay, filters);

    // Appliquer la recherche
    const withSearch = withFilters.filter(
      (a) => searchFilter(a.title) || searchFilter(a.description || ""),
    );

    console.log("📊 Résultat final:", withSearch.length, "articles");
    return withSearch;
  }, [articlesToDisplay, filters, applyFilters, searchFilter]);

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

  // Extrait le nom du média depuis le titre
  const extractMediaName = (title: string): string => {
    if (!title) return "Flux sans nom";

    let mediaName = title;

    // Supprime les suffixes courants
    const separators = [" | ", " - ", ":", " — ", " • "];
    for (const sep of separators) {
      if (mediaName.includes(sep)) {
        mediaName = mediaName.split(sep)[0];
        break;
      }
    }

    // Nettoie les espaces
    mediaName = mediaName.trim();

    // Limite à 45 caractères (un peu plus que avant)
    return mediaName.length > 45
      ? mediaName.substring(0, 42) + "..."
      : mediaName;
  };

  // Extrait le domaine de l'URL (optionnel)
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url;
    }
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
            {/* Onglet Par catégorie (nouveau) */}
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

            {/* Onglet Tous les articles (anciennement premier) */}
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

            {/* Onglet Par flux RSS */}
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
      <ActualitesFilters
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        mediaOptions={mediaOptions}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === "feeds" ? (
          /* Mode "Par flux" : Deux colonnes */
          <FeedsView
            feeds={feeds}
            selectedFeed={selectedFeed}
            setSelectedFeed={setSelectedFeed}
            articles={articles}
            filteredArticles={filteredArticles}
            filters={filters}
            setFilters={setFilters}
            mediaOptions={mediaOptions}
            filteredFeedsByMedia={filteredFeedsByMedia}
            loadingArticles={loadingArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteFeed={deleteFeed}
            extractMediaName={extractMediaName}
            extractDomain={extractDomain}
          />
        ) : viewMode === "category" ? (
          /* Mode "Par catégorie" */
          <CategoryView
            articles={filteredArticles}
            filters={filters}
            loading={loadingAllArticles}
          />
        ) : (
          /* Mode "Tous les articles" : Une seule colonne centrée */
          <AllView
            articles={articles}
            filteredArticles={filteredArticles}
            allArticles={allArticles}
            uniqueArticles={uniqueArticles}
            loading={loadingAllArticles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}
