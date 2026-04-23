// src/app/(dashboard)/news/news-sections/CategoryView.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Article } from "@/types/Article";
import { Filters } from "@/types/Filters";
import { RSSFeed } from "@/types/RSSFeed";
import { CategoryNode } from "@/types/CategoryNode";
import { buildCategoryTree } from "@/lib/category/treeBuilder";
import {
  Plus,
  Trash2,
  Edit2,
  Folder,
  FolderPlus,
  Rss,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  FolderTree,
  FileText,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Source } from "@/types/Source";
import { HighlightText } from "@/components/prc/HighlightText";

// Clés pour sessionStorage
const STORAGE_KEYS = {
  SELECTED_NODE_ID: "categoryView_selectedNodeId",
  ACTIVE_FILTER_ID: "categoryView_activeFilterId",
  EXPANDED_NODES: "categoryView_expandedNodes",
};

interface CategoryViewProps {
  articles: Article[];
  filters: Filters;
  loading?: boolean;
  onGenerateReport?: (articles: Article[], nodeTitle: string) => void;
  onRefresh?: () => void;
  onFilterChange?: (filterId: string | null) => void;
}

// Modal d'ajout de catégorie
function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, url?: string) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Veuillez entrer un nom de catégorie");
      return;
    }
    onAdd(name.trim(), url.trim() || undefined);
    setName("");
    setUrl("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Ajouter une catégorie
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Actualités"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL RSS (optionnel)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.lapresse.ca/actualites/rss"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si renseigné, cette catégorie aura son propre flux RSS
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal pour transformer un flux en catégorie
function ConvertToCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  feedTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedTitle: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Transformer en catégorie
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Voulez-vous transformer le flux <strong>{feedTitle}</strong> en
            catégorie ?
          </p>
          <p className="text-sm text-gray-500">
            Il conservera son URL et son titre. Vous pourrez y ajouter des
            sous-catégories et d&apos;autres flux.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Transformer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant d'affichage des articles pour le nœud sélectionné
function NodeArticles({
  selectedNode,
  allArticles,
  loading,
  filters,
  onRefresh,
}: {
  selectedNode: CategoryNode | null;
  allArticles: Article[];
  loading?: boolean;
  filters?: {
    showContentOnly?: boolean;
    showPaywallOnly?: boolean;
  };
  onRefresh?: () => void;
}) {
  const [nodeArticles, setNodeArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getFeedIdsFromNode = useCallback((node: CategoryNode): string[] => {
    let ids: string[] = [];
    ids.push(node.id);
    node.children.forEach((child) => {
      ids = [...ids, ...getFeedIdsFromNode(child)];
    });
    return ids;
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setNodeArticles([]);
      return;
    }

    const feedIds = getFeedIdsFromNode(selectedNode);
    if (feedIds.length === 0) {
      setNodeArticles([]);
      return;
    }

    const filtered = allArticles.filter(
      (article) => article.feedId && feedIds.includes(article.feedId),
    );

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    );

    setNodeArticles(sorted);
  }, [selectedNode, allArticles, getFeedIdsFromNode]);

  const filteredArticles = nodeArticles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      (article.description && article.description.toLowerCase().includes(query))
    );
  });

  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <Rss className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Sélectionnez une catégorie ou un flux</p>
          <p className="text-sm mt-2">Pour voir les articles correspondants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="py-6 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedNode.title}
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
              {selectedNode.url && (
                <p className="text-xs text-green-600 mt-1 truncate">
                  📡 Flux: {selectedNode.url}
                </p>
              )}
              {selectedNode.children.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedNode.children.length} flux
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {filters?.showContentOnly && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    Avec contenu
                  </span>
                )}
                {filters?.showPaywallOnly && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    <DollarSign className="w-3 h-3" />
                    Payant
                  </span>
                )}
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredArticles.length} article
                  {filteredArticles.length > 1 ? "s" : ""}
                </div>
              </div>

              {filteredArticles.length > 0 && (
                <button
                  onClick={() => {
                    const event = new CustomEvent("generateReport", {
                      detail: {
                        articles: filteredArticles,
                        nodeTitle: selectedNode.title,
                      },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Rapport Actualités
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="relative w-full mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans les articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement des articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Rss className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun article disponible</p>
            {selectedNode.url && (
              <p className="text-sm text-gray-400 mt-2">
                Ce flux ne contient pas d&apos;articles pour le moment
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => (
              <article
                key={`${article.feedId}-${article.link}-${index}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
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
                  <HighlightText text={article.title} query={searchQuery} />
                </h2>

                {article.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    <HighlightText
                      text={article.description}
                      query={searchQuery}
                    />
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
                    Lire l&apos;article
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
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

// Composant de ligne d'arborescence
function TreeNode({
  node,
  level,
  expandedNodes,
  onToggleExpand,
  onRename,
  onDelete,
  onAddChild,
  onConvertToCategory,
  onSelectNode,
  selectedNodeId,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverId,
  editingNodeId,
  setEditingNodeId,
  editingName,
  setEditingName,
  searchQuery,
}: any) {
  const isExpanded = expandedNodes.has(node.id);
  const isEditing = editingNodeId === node.id;
  const isDragOver = dragOverId === node.id;
  const isSelected = selectedNodeId === node.id;
  const isFeed = node.nodeType === "feed";

  const handleRename = () => {
    if (editingName.trim() && editingName !== node.title) {
      onRename(node.id, editingName.trim());
    }
    setEditingNodeId(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node);
  };

  return (
    <div>
      <div
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(node.id, node.nodeType, node.sourceId);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDragOver(e, node.id);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          onDragOver(null, null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(e, node.id, node.nodeType);
        }}
        onClick={handleClick}
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer
          hover:bg-gray-100
          ${isDragOver ? "bg-blue-50 border-2 border-blue-300" : ""}
          ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}
        `}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {node.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        {node.children.length === 0 && <div className="w-5 flex-shrink-0" />}

        {node.nodeType === "category" ? (
          node.url ? (
            <FolderTree className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <Rss className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}

        {isEditing ? (
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setEditingNodeId(null);
            }}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-black"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-gray-700">
            <HighlightText text={node.title} query={searchQuery} />
            {node.url && (
              <span className="text-xs text-green-600 ml-2 truncate max-w-xs inline-block">
                📡
              </span>
            )}
          </span>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingNodeId(node.id);
              setEditingName(node.title);
            }}
            className="p-1 text-gray-400 hover:text-blue-500 rounded"
            title="Renommer"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {isFeed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConvertToCategory(
                  node.id,
                  node.title,
                  node.url,
                  node.sourceId,
                );
              }}
              className="p-1 text-gray-400 hover:text-purple-500 rounded"
              title="Transformer en catégorie"
            >
              <FolderTree className="w-3 h-3" />
            </button>
          )}

          {node.nodeType === "category" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id, node.sourceId);
              }}
              className="p-1 text-gray-400 hover:text-green-500 rounded"
              title="Ajouter une sous-catégorie"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id, node.nodeType, node.title);
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map((child: CategoryNode) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onConvertToCategory={onConvertToCategory}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragOverId={dragOverId}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
              editingName={editingName}
              setEditingName={setEditingName}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryView({
  articles,
  filters,
  loading,
  onGenerateReport,
  onRefresh,
  onFilterChange,
}: CategoryViewProps) {
  const [allFeeds, setAllFeeds] = useState<RSSFeed[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CategoryNode | null>(null);
  const [loadingTree, setLoadingTree] = useState(true);
  const [interestFilters, setInterestFilters] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertTarget, setConvertTarget] = useState<{
    id: string;
    title: string;
    url?: string | null;
    sourceId?: string | null;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{
    id: string;
    type: string;
    sourceId?: string | null;
  } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRestoring, setIsRestoring] = useState(true);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expandedNodesRef = useRef(expandedNodes);

  // Sauvegarder l'état dans sessionStorage
  const saveStateToStorage = useCallback(() => {
    if (selectedNode) {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_NODE_ID, selectedNode.id);
    }
    if (filters.activeInterestFilters.length > 0) {
      sessionStorage.setItem(
        STORAGE_KEYS.ACTIVE_FILTER_ID,
        filters.activeInterestFilters[0],
      );
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_FILTER_ID);
    }
    sessionStorage.setItem(
      STORAGE_KEYS.EXPANDED_NODES,
      JSON.stringify(Array.from(expandedNodes)),
    );
  }, [selectedNode, filters.activeInterestFilters, expandedNodes]);

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateToStorage();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStateToStorage]);

  // Sauvegarder quand l'état change
  useEffect(() => {
    if (!isRestoring) {
      saveStateToStorage();
    }
  }, [
    selectedNode,
    filters.activeInterestFilters,
    expandedNodes,
    isRestoring,
    saveStateToStorage,
  ]);

  useEffect(() => {
    expandedNodesRef.current = expandedNodes;
  }, [expandedNodes]);

  const fetchInterestFilters = useCallback(async () => {
    try {
      const res = await fetch("/api/interest-filters");
      const data = await res.json();
      setInterestFilters(data);
    } catch (error) {
      console.error("Erreur chargement filtres:", error);
    }
  }, []);

  const findNodeById = useCallback(
    (nodes: CategoryNode[], id: string): CategoryNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
      return null;
    },
    [],
  );

  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/rss-feeds");
      const data = await res.json();
      setAllFeeds(data);
      const categoryTree = buildCategoryTree(data);
      setTree(categoryTree);

      // Restaurer la sélection depuis sessionStorage (seulement au premier chargement)
      if (isRestoring) {
        const savedNodeId = sessionStorage.getItem(
          STORAGE_KEYS.SELECTED_NODE_ID,
        );
        if (savedNodeId) {
          const node = findNodeById(categoryTree, savedNodeId);
          if (node) {
            setSelectedNode(node);
          } else if (categoryTree.length > 0) {
            setSelectedNode(categoryTree[0]);
          }
        } else if (categoryTree.length > 0) {
          setSelectedNode(categoryTree[0]);
        }

        // Restaurer les nœuds ouverts
        const savedExpanded = sessionStorage.getItem(
          STORAGE_KEYS.EXPANDED_NODES,
        );
        if (savedExpanded) {
          try {
            const expandedArray = JSON.parse(savedExpanded);
            setExpandedNodes(new Set(expandedArray));
          } catch (e) {
            console.error("Erreur restauration expandedNodes:", e);
          }
        }

        // Restaurer le filtre actif
        const savedFilterId = sessionStorage.getItem(
          STORAGE_KEYS.ACTIVE_FILTER_ID,
        );

        if (savedFilterId && onFilterChange) {
          onFilterChange(savedFilterId);
        }

        setIsRestoring(false);
      }
    } catch (error) {
      console.error("Erreur chargement flux:", error);
    } finally {
      setLoadingTree(false);
    }
  }, [findNodeById, interestFilters, onFilterChange, isRestoring]);

  // Charger les filtres d'abord
  useEffect(() => {
    fetchInterestFilters();
  }, [fetchInterestFilters]);

  // Puis charger les flux (après que les filtres soient chargés)
  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  // Intervalle de rafraîchissement sans recharger la sélection
  useEffect(() => {
    refreshIntervalRef.current = setInterval(async () => {
      const savedExpanded = new Set(expandedNodesRef.current);
      const savedSelectedNodeId = selectedNode?.id;

      try {
        const res = await fetch("/api/rss-feeds");
        const data = await res.json();
        setAllFeeds(data);
        const categoryTree = buildCategoryTree(data);
        setTree(categoryTree);
        setExpandedNodes(savedExpanded);

        // Restaurer la sélection si le nœud existe toujours
        if (savedSelectedNodeId) {
          const node = findNodeById(categoryTree, savedSelectedNodeId);
          if (node) {
            setSelectedNode(node);
          }
        }
      } catch (error) {
        console.error("Erreur rafraîchissement:", error);
      }
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedNode?.id, findNodeById]);

  // Écouter l'événement de rafraîchissement manuel
  useEffect(() => {
    const handleRefresh = async () => {
      const savedExpanded = new Set(expandedNodesRef.current);
      const savedSelectedNodeId = selectedNode?.id;

      await fetchFeeds();
      setExpandedNodes(savedExpanded);

      if (savedSelectedNodeId) {
        const node = findNodeById(tree, savedSelectedNodeId);
        if (node) {
          setSelectedNode(node);
        }
      }
    };

    window.addEventListener("refreshFeeds", handleRefresh);
    return () => window.removeEventListener("refreshFeeds", handleRefresh);
  }, [fetchFeeds, tree, findNodeById, selectedNode?.id]);

  const handleSelectNode = useCallback((node: CategoryNode) => {
    setSelectedNode(node);
  }, []);

  const handleFilterSelect = useCallback(
    (filterId: string | null) => {
      if (onFilterChange) {
        onFilterChange(filterId);
      }
    },
    [onFilterChange],
  );

  const createCategory = async (
    name: string,
    parentId: string | null = null,
    sourceId?: string | null,
    url?: string,
  ) => {
    try {
      const res = await fetch("/api/rss-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name,
          nodeType: "category",
          parentId,
          sourceId: sourceId || null,
          url: url || null,
        }),
      });

      if (res.ok) {
        await fetchFeeds();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const convertFeedToCategory = async () => {
    if (!convertTarget) return;

    try {
      const res = await fetch(`/api/rss-feeds/${convertTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeType: "category",
          title: convertTarget.title,
          url: convertTarget.url,
          sourceId: convertTarget.sourceId,
        }),
      });

      if (res.ok) {
        await fetchFeeds();
        setShowConvertModal(false);
        setConvertTarget(null);
      } else {
        alert("Erreur lors de la transformation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const handleAddRootCategory = (name: string, url?: string) => {
    createCategory(name, null, null, url);
  };

  const createChildCategory = async (
    parentId: string,
    parentSourceId?: string | null,
  ) => {
    const name = prompt("Nom de la sous-catégorie:");
    if (!name?.trim()) return;

    const hasUrl = confirm("Ajouter une URL RSS pour cette catégorie ?");
    let url = "";
    if (hasUrl) {
      url = prompt("Entrez l'URL du flux RSS:", "") || "";
    }

    createCategory(name.trim(), parentId, parentSourceId, url || undefined);
  };

  const renameNode = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/rss-feeds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newName }),
      });

      if (res.ok) {
        await fetchFeeds();
      }
    } catch (error) {
      console.error("Erreur renommage:", error);
    }
  };

  const deleteNode = async (id: string, nodeType: string, title: string) => {
    if (
      !confirm(
        `Supprimer "${title}" ? Les éléments enfants seront également supprimés.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/rss-feeds/${id}`, { method: "DELETE" });

      if (res.ok) {
        await fetchFeeds();
        if (selectedNode?.id === id) {
          setSelectedNode(null);
          sessionStorage.removeItem(STORAGE_KEYS.SELECTED_NODE_ID);
        }
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const moveItem = async (itemId: string, targetId: string | null) => {
    try {
      const res = await fetch(`/api/rss-feeds/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: targetId }),
      });

      if (res.ok) {
        await fetchFeeds();
      }
    } catch (error) {
      console.error("Erreur déplacement:", error);
    }
  };

  const handleDragStart = (
    id: string,
    type: string,
    sourceId?: string | null,
  ) => {
    setDragItem({ id, type, sourceId: sourceId || undefined });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (e) e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetId: string,
    targetType: string,
  ) => {
    if (e) e.preventDefault();
    setDragOverId(null);
    if (!dragItem) return;
    if (dragItem.id === targetId) return;
    await moveItem(dragItem.id, targetId);
    setDragItem(null);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  };

  const filterTree = (nodes: CategoryNode[]): CategoryNode[] => {
    if (!searchQuery) return nodes;
    return nodes
      .filter((node) => {
        const matches = node.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const childrenMatch = filterTree(node.children).length > 0;
        return matches || childrenMatch;
      })
      .map((node) => ({
        ...node,
        children: filterTree(node.children),
      }));
  };

  const filteredTree = filterTree(tree);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        {/* En-tête avec titre, recherche et bouton + sur une seule ligne */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 flex-shrink-0">
              <span>📁</span>
              Catégories
            </h2>

            {/* Champ de recherche - occupe tout l'espace disponible */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Bouton ajouter */}
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
              title="Ajouter une catégorie"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Arborescence des catégories - prend tout l'espace restant */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingTree ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : filteredTree.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune catégorie</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-blue-500 hover:text-blue-600"
              >
                + Ajouter une catégorie
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  expandedNodes={expandedNodes}
                  onToggleExpand={toggleExpand}
                  onRename={renameNode}
                  onDelete={deleteNode}
                  onAddChild={createChildCategory}
                  onConvertToCategory={(
                    id: string,
                    title: string,
                    url?: string | null,
                    sourceId?: string | null,
                  ) => {
                    setConvertTarget({ id, title, url, sourceId });
                    setShowConvertModal(true);
                  }}
                  onSelectNode={handleSelectNode}
                  selectedNodeId={selectedNode?.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverId={dragOverId}
                  editingNodeId={editingNodeId}
                  setEditingNodeId={setEditingNodeId}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <NodeArticles
          selectedNode={selectedNode}
          allArticles={articles}
          loading={loading || loadingTree}
          filters={{
            showContentOnly: filters.showContentOnly,
            showPaywallOnly: filters.showPaywallOnly,
          }}
          onRefresh={onRefresh}
        />
      </div>

      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRootCategory}
      />

      <ConvertToCategoryModal
        isOpen={showConvertModal}
        onClose={() => {
          setShowConvertModal(false);
          setConvertTarget(null);
        }}
        onConfirm={convertFeedToCategory}
        feedTitle={convertTarget?.title || ""}
      />
    </div>
  );
}
