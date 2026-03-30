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
} from "lucide-react";
import { Source } from "@/types/Source";

interface CategoryViewProps {
  articles: Article[];
  filters: Filters;
  loading?: boolean;
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
}: {
  selectedNode: CategoryNode | null;
  allArticles: Article[];
  loading?: boolean;
}) {
  const [nodeArticles, setNodeArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fonction pour récupérer tous les IDs de flux d'un nœud et de ses enfants
  const getFeedIdsFromNode = useCallback((node: CategoryNode): string[] => {
    let ids: string[] = [];

    // Si le nœud lui-même a un ID (c'est un flux ou une catégorie avec URL)
    ids.push(node.id);

    // Récupérer les IDs des enfants
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

    // Filtrer les articles dont le feedId est dans la liste
    const filtered = allArticles.filter(
      (article) => article.feedId && feedIds.includes(article.feedId),
    );

    // Trier par date décroissante
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
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedNode.title}
              </h1>
              {selectedNode.url && (
                <p className="text-xs text-green-600 mt-1 truncate">
                  📡 Flux: {selectedNode.url}
                </p>
              )}
              {selectedNode.children.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedNode.children.length} sous-élément(s)
                </p>
              )}
            </div>
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

        {/* Liste des articles */}
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
        {/* Expand/Collapse */}
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

        {/* Icône */}
        {node.nodeType === "category" ? (
          node.url ? (
            <FolderTree className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <Rss className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}

        {/* Édition ou affichage */}
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
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-gray-700">
            {node.title}
            {node.url && (
              <span className="text-xs text-green-600 ml-2 truncate max-w-xs inline-block">
                📡
              </span>
            )}
          </span>
        )}

        {/* Actions */}
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

          {/* Bouton Transformer en catégorie (uniquement pour les flux) */}
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

      {/* Rendu des enfants */}
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
}: CategoryViewProps) {
  const [allFeeds, setAllFeeds] = useState<RSSFeed[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CategoryNode | null>(null);
  const [loadingTree, setLoadingTree] = useState(true);

  // ✅ État initial : tous les nœuds fermés
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

  // Drag & drop state
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{
    id: string;
    type: string;
    sourceId?: string | null;
  } | null>(null);

  // Edition state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Référence pour l'intervalle de rafraîchissement
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Référence pour stocker l'état actuel des nœuds ouverts
  const expandedNodesRef = useRef(expandedNodes);

  // Mettre à jour la référence quand expandedNodes change
  useEffect(() => {
    expandedNodesRef.current = expandedNodes;
  }, [expandedNodes]);

  // Charger les flux
  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/rss-feeds");
      const data = await res.json();
      setAllFeeds(data);

      // Construire l'arbre
      const categoryTree = buildCategoryTree(data);
      setTree(categoryTree);

      // ✅ NE PAS réinitialiser expandedNodes ici
      // Garder l'état actuel des nœuds ouverts
    } catch (error) {
      console.error("Erreur chargement flux:", error);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();

    // ✅ Intervalle avec préservation de l'état des nœuds
    refreshIntervalRef.current = setInterval(async () => {
      // Sauvegarder l'état actuel avant rafraîchissement
      const savedExpanded = new Set(expandedNodesRef.current);

      try {
        const res = await fetch("/api/rss-feeds");
        const data = await res.json();
        setAllFeeds(data);

        // Reconstruire l'arbre
        const categoryTree = buildCategoryTree(data);
        setTree(categoryTree);

        // ✅ Restaurer l'état des nœuds ouverts
        setExpandedNodes(savedExpanded);
      } catch (error) {
        console.error("Erreur rafraîchissement:", error);
      }
    }, 5000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchFeeds]); // ✅ expandedNodes n'est PAS dans les dépendances

  // Écouter l'événement de rafraîchissement
  useEffect(() => {
    const handleRefresh = async () => {
      const savedExpanded = new Set(expandedNodesRef.current);

      await fetchFeeds();
      setExpandedNodes(savedExpanded);
    };

    window.addEventListener("refreshFeeds", handleRefresh);

    return () => {
      window.removeEventListener("refreshFeeds", handleRefresh);
    };
  }, [fetchFeeds]);

  // Créer une catégorie
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

  // Transformer un flux en catégorie
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

  // Créer une catégorie racine
  const handleAddRootCategory = (name: string, url?: string) => {
    createCategory(name, null, null, url);
  };

  // Créer une sous-catégorie
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

  // Renommer un nœud
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

  // Supprimer un nœud
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
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Déplacer un élément
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

  // Gestion du drag & drop
  const handleDragStart = (
    id: string,
    type: string,
    sourceId?: string | null,
  ) => {
    setDragItem({ id, type, sourceId: sourceId || undefined });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (e) {
      e.preventDefault();
    }
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
    if (e) {
      e.preventDefault();
    }
    setDragOverId(null);

    if (!dragItem) return;
    if (dragItem.id === targetId) return;

    await moveItem(dragItem.id, targetId);
    setDragItem(null);
  };

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Filtrer l'arbre par recherche
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

  // Sélectionner automatiquement le premier nœud non-vide
  useEffect(() => {
    if (filteredTree.length > 0 && !selectedNode) {
      setSelectedNode(filteredTree[0]);
    }
  }, [filteredTree, selectedNode]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Colonne de gauche - Arborescence (30% de largeur) */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>📁</span>
              Catégories
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ajouter une catégorie"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Arborescence */}
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
                  onSelectNode={setSelectedNode}
                  selectedNodeId={selectedNode?.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverId={dragOverId}
                  editingNodeId={editingNodeId}
                  setEditingNodeId={setEditingNodeId}
                  editingName={editingName}
                  setEditingName={setEditingName}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colonne de droite - Articles (occupe tout l'espace restant) */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <NodeArticles
          selectedNode={selectedNode}
          allArticles={articles}
          loading={loading || loadingTree}
        />
      </div>

      {/* Modal d'ajout de catégorie */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRootCategory}
      />

      {/* Modal de transformation en catégorie */}
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
