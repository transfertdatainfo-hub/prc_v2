// src/app/(dashboard)/news/news-sections/CategoryTree.tsx

"use client";

import { useState, useEffect } from "react";
import { CategoryNode } from "@/types/CategoryNode";
import { Article } from "@/types/Article";
import {
  ChevronRight,
  ChevronDown,
  Rss,
  Folder,
  FolderOpen,
  Newspaper,
  Settings,
} from "lucide-react";

interface CategoryTreeProps {
  tree: CategoryNode[];
  articles: Article[];
  loading?: boolean;
  onSelectNode: (node: CategoryNode) => void;
  selectedNodeId?: string | null;
  onOpenSettings: () => void;
}

export default function CategoryTree({
  tree,
  articles,
  loading,
  onSelectNode,
  selectedNodeId,
  onOpenSettings,
}: CategoryTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [articleCountMap, setArticleCountMap] = useState<Map<string, number>>(
    new Map(),
  );

  // Initialiser tous les nœuds comme expandés par défaut
  useEffect(() => {
    const initialExpanded = new Set<string>();
    const expandAll = (nodes: CategoryNode[]) => {
      nodes.forEach((node) => {
        initialExpanded.add(node.id);
        if (node.children.length > 0) {
          expandAll(node.children);
        }
      });
    };
    expandAll(tree);
    setExpandedNodes(initialExpanded);
  }, [tree]);

  // Calculer le nombre d'articles par nœud
  useEffect(() => {
    const countMap = new Map<string, number>();

    // Compter les articles par feedId
    articles.forEach((article) => {
      if (article.feedId) {
        const current = countMap.get(article.feedId) || 0;
        countMap.set(article.feedId, current + 1);
      }
    });

    setArticleCountMap(countMap);
  }, [articles]);

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeCount = (node: CategoryNode): number => {
    let count = articleCountMap.get(node.id) || 0;
    node.children.forEach((child) => {
      count += getNodeCount(child);
    });
    return count;
  };

  const renderNode = (node: CategoryNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const articleCount = getNodeCount(node);

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => onSelectNode(node)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
            hover:bg-gray-100 group
            ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}
          `}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {/* Bouton expand/collapse */}
          {node.children.length > 0 && (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {/* Espace si pas d'enfants */}
          {node.children.length === 0 && <div className="w-5 flex-shrink-0" />}

          {/* Icône selon le type */}
          {node.nodeType === "category" ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )
          ) : (
            <Rss className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}

          {/* Titre */}
          <span
            className={`flex-1 text-sm truncate ${isSelected ? "font-medium text-blue-600" : "text-gray-700"}`}
          >
            {node.title}
          </span>

          {/* Badge nombre d'articles */}
          {articleCount > 0 && (
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full flex-shrink-0
              ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}
            `}
            >
              {articleCount}
            </span>
          )}
        </div>

        {/* Rendu des enfants */}
        {isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-pulse">
          Chargement de l&apos;arborescence...
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="mb-2">Aucune catégorie configurée</p>
        <p className="text-sm text-gray-400">
          Ajoutez des flux RSS, puis organisez-les en catégories
        </p>
        <button
          onClick={onOpenSettings}
          className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Configurer l&apos;arborescence
        </button>
      </div>
    );
  }

  return <div className="py-2">{tree.map((node) => renderNode(node, 0))}</div>;
}
