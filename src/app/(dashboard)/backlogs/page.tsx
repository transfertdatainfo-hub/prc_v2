"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Backlog, BacklogNode } from "@/types/Backlog";
import {
  Plus,
  Trash2,
  Edit2,
  Folder,
  GitBranch,
  CheckSquare,
  Highlighter,
  GripVertical,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

// Couleurs disponibles pour la surbrillance
const HIGHLIGHT_COLORS = [
  { name: "Jaune", value: "#fef08a" },
  { name: "Vert", value: "#bbf7d0" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Rouge", value: "#fecaca" },
  { name: "Violet", value: "#e9d5ff" },
];

// Icônes par type
const TYPE_ICONS = {
  folder: Folder,
  task: GitBranch,
  subtask: CheckSquare,
};

const iconColors = {
  folder: "text-amber-500",
  task: "text-blue-500",
  subtask: "text-green-500",
};

// Configuration des types
const TYPE_CONFIG = {
  folder: {
    label: "Dossier",
    canHaveChildren: true,
    allowedChildren: ["task", "subtask"],
  },
  task: { label: "Tâche", canHaveChildren: true, allowedChildren: ["subtask"] },
  subtask: { label: "Sous-tâche", canHaveChildren: false, allowedChildren: [] },
};

// Fonction pour construire l'arborescence
function buildBacklogTree(items: Backlog[]): BacklogNode[] {
  const itemMap = new Map<string, BacklogNode>();
  const roots: BacklogNode[] = [];

  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByPosition = (nodes: BacklogNode[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((node) => sortByPosition(node.children));
  };
  sortByPosition(roots);

  return roots;
}

// Palette de couleurs
function ColorPalette({
  isOpen,
  onClose,
  onSelect,
  currentColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (color: string | null) => void;
  currentColor?: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex gap-2">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => {
              onSelect(color.value);
              onClose();
            }}
            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
              currentColor === color.value
                ? "ring-2 ring-gray-400 ring-offset-1"
                : ""
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
        {currentColor && (
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200"
            title="Supprimer la surbrillance"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// Composant TreeNode
function BacklogTreeNode({
  node,
  level,
  expandedNodes,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  onHighlight,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverId,
  selectedItems,
  onSelectItem,
  listType,
}: any) {
  const isExpanded = expandedNodes.has(node.id);
  const isDragOver = dragOverId === node.id;
  const isSelected = selectedItems.has(node.id);
  const hasHighlight = node.highlightColor;
  const Icon =
    TYPE_ICONS[node.backlogType as keyof typeof TYPE_ICONS] || Folder;
  const config = TYPE_CONFIG[node.backlogType as keyof typeof TYPE_CONFIG];

  return (
    <div>
      <div
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(node.id, listType);
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
          onDrop(e, node.id, listType);
        }}
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer
          hover:bg-gray-100
          ${isDragOver ? "bg-blue-50 border-2 border-blue-300" : ""}
          ${isSelected ? "bg-blue-100 border-l-4 border-blue-500" : ""}
          ${hasHighlight ? "border-l-4" : ""}
        `}
        style={{
          marginLeft: `${level * 20}px`,
          borderLeftColor: hasHighlight || undefined,
          backgroundColor: hasHighlight || undefined,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectItem(node.id, e.ctrlKey || e.metaKey);
        }}
      >
        <div className="flex items-center gap-1 cursor-grab" title="Déplacer">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

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

        <Icon
          className={`w-4 h-4 ${iconColors[node.backlogType as keyof typeof iconColors] || "text-gray-500"} flex-shrink-0`}
        />

        <span className="flex-1 text-sm text-gray-700">{node.title}</span>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHighlight(node.id);
              }}
              className="p-1 text-gray-400 hover:text-yellow-500 rounded"
              title="Surbrillance"
            >
              <Highlighter className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-1 text-gray-400 hover:text-blue-500 rounded"
            title="Modifier"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {config.canHaveChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node);
              }}
              className="p-1 text-gray-400 hover:text-green-500 rounded"
              title="Ajouter un enfant"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(node.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 rounded"
            title="Monter"
          >
            ↑
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(node.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 rounded"
            title="Descendre"
          >
            ↓
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id, node.title, node.children.length > 0);
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
          {node.children.map((child: BacklogNode) => (
            <BacklogTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onHighlight={onHighlight}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragOverId={dragOverId}
              selectedItems={selectedItems}
              onSelectItem={onSelectItem}
              listType={listType}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant BacklogList
function BacklogList({
  title,
  type,
  items,
  onAddRoot,
  onEdit,
  onDelete,
  onAddChild,
  onHighlight,
  onMoveUp,
  onMoveDown,
  onMoveBetweenLists,
  selectedItems,
  onSelectItem,
}: {
  title: string;
  type: "project" | "sprint";
  items: BacklogNode[];
  onAddRoot: (type: string) => void;
  onEdit: (node: BacklogNode) => void;
  onDelete: (id: string, title: string, hasChildren: boolean) => void;
  onAddChild: (parent: BacklogNode) => void;
  onHighlight: (id: string, currentColor: string | null) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onMoveBetweenLists: (itemIds: string[], targetListType: string) => void;
  selectedItems: Set<string>;
  onSelectItem: (id: string, multiSelect: boolean) => void;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{
    id: string;
    sourceType: string;
  } | null>(null);
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);

  useEffect(() => {
    const initialExpanded = new Set<string>();
    const expandAll = (nodes: BacklogNode[]) => {
      nodes.forEach((node) => {
        initialExpanded.add(node.id);
        expandAll(node.children);
      });
    };
    expandAll(items);
    setExpandedNodes(initialExpanded);
  }, [items]);

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

  const handleDragStart = (id: string, sourceType: string) => {
    setDragItem({ id, sourceType });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (e) e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetId: string,
    targetType: string,
  ) => {
    if (e) e.preventDefault();
    setDragOverId(null);
    if (!dragItem) return;

    if (dragItem.sourceType === targetType) {
      onMoveBetweenLists([dragItem.id], targetType);
    } else {
      onMoveBetweenLists([dragItem.id], targetType);
    }
    setDragItem(null);
  };

  const handleHighlightClick = (id: string, currentColor: string | null) => {
    setHighlightTarget(highlightTarget === id ? null : id);
  };

  return (
    <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>📋</span>
          {title}
        </h2>
        <button
          onClick={() => onAddRoot(type)}
          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ajouter un item backlog"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun item backlog</p>
            <button
              onClick={() => onAddRoot(type)}
              className="mt-3 text-sm text-blue-500 hover:text-blue-600"
            >
              + Ajouter un item backlog
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((node) => (
              <div key={node.id} className="relative">
                <BacklogTreeNode
                  node={node}
                  level={0}
                  expandedNodes={expandedNodes}
                  onToggleExpand={toggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onHighlight={() =>
                    handleHighlightClick(node.id, node.highlightColor)
                  }
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverId={dragOverId}
                  selectedItems={selectedItems}
                  onSelectItem={onSelectItem}
                  listType={type}
                />
                {highlightTarget === node.id && (
                  <div
                    style={{
                      position: "absolute",
                      left: "200px",
                      top: "30px",
                      zIndex: 20,
                    }}
                  >
                    <ColorPalette
                      isOpen={true}
                      onClose={() => setHighlightTarget(null)}
                      onSelect={(color) => {
                        onHighlight(node.id, color);
                        setHighlightTarget(null);
                      }}
                      currentColor={node.highlightColor}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItems.size > 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          {selectedItems.size} élément(s) sélectionné(s)
        </div>
      )}
    </div>
  );
}

// Page principale
export default function BacklogsPage() {
  const router = useRouter();
  const [projectBacklogs, setProjectBacklogs] = useState<BacklogNode[]>([]);
  const [sprintBacklogs, setSprintBacklogs] = useState<BacklogNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectItems, setSelectedProjectItems] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSprintItems, setSelectedSprintItems] = useState<Set<string>>(
    new Set(),
  );

  const fetchBacklogs = useCallback(async () => {
    try {
      const res = await fetch("/api/backlogs");
      const data = await res.json();
      const projects = data.filter((b: Backlog) => b.type === "project");
      const sprints = data.filter((b: Backlog) => b.type === "sprint");
      setProjectBacklogs(buildBacklogTree(projects));
      setSprintBacklogs(buildBacklogTree(sprints));
    } catch (error) {
      console.error("Erreur chargement backlogs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBacklogs();
  }, [fetchBacklogs]);

  const deleteBacklog = async (
    id: string,
    title: string,
    hasChildren: boolean,
  ) => {
    if (hasChildren) {
      alert(
        `Impossible de supprimer "${title}" car il contient des sous-éléments.`,
      );
      return;
    }
    if (!confirm(`Supprimer "${title}" ?`)) return;

    try {
      const res = await fetch(`/api/backlogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBacklogs();
        setSelectedProjectItems(new Set());
        setSelectedSprintItems(new Set());
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const moveItem = async (
    itemId: string,
    newParentId: string | null,
    newType: string,
  ) => {
    try {
      await fetch(`/api/backlogs/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: newParentId, type: newType }),
      });
      await fetchBacklogs();
    } catch (error) {
      console.error("Erreur déplacement:", error);
    }
  };

  const reorderItems = async (items: { id: string; position: number }[]) => {
    try {
      await fetch("/api/backlogs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      await fetchBacklogs();
    } catch (error) {
      console.error("Erreur réorganisation:", error);
    }
  };

  const moveUp = async (id: string, type: string) => {
    const list = type === "project" ? projectBacklogs : sprintBacklogs;
    const flatItems: BacklogNode[] = [];
    const flatten = (nodes: BacklogNode[]) => {
      nodes.forEach((node) => {
        flatItems.push(node);
        flatten(node.children);
      });
    };
    flatten(list);

    const index = flatItems.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const current = flatItems[index];
    const prev = flatItems[index - 1];

    await reorderItems([
      { id: current.id, position: prev.position },
      { id: prev.id, position: current.position },
    ]);
  };

  const moveDown = async (id: string, type: string) => {
    const list = type === "project" ? projectBacklogs : sprintBacklogs;
    const flatItems: BacklogNode[] = [];
    const flatten = (nodes: BacklogNode[]) => {
      nodes.forEach((node) => {
        flatItems.push(node);
        flatten(node.children);
      });
    };
    flatten(list);

    const index = flatItems.findIndex((item) => item.id === id);
    if (index === -1 || index >= flatItems.length - 1) return;

    const current = flatItems[index];
    const next = flatItems[index + 1];

    await reorderItems([
      { id: current.id, position: next.position },
      { id: next.id, position: current.position },
    ]);
  };

  const updateHighlight = async (id: string, color: string | null) => {
    try {
      await fetch(`/api/backlogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlightColor: color }),
      });
      await fetchBacklogs();
    } catch (error) {
      console.error("Erreur mise à jour surbrillance:", error);
    }
  };

  const moveBetweenLists = async (itemIds: string[], targetType: string) => {
    for (const id of itemIds) {
      await moveItem(id, null, targetType);
    }
    setSelectedProjectItems(new Set());
    setSelectedSprintItems(new Set());
  };

  const handleSelectProjectItem = (id: string, multiSelect: boolean) => {
    setSelectedProjectItems((prev) => {
      const newSet = new Set(prev);
      if (multiSelect) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id) && newSet.size === 1) {
          newSet.delete(id);
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

  const handleSelectSprintItem = (id: string, multiSelect: boolean) => {
    setSelectedSprintItems((prev) => {
      const newSet = new Set(prev);
      if (multiSelect) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id) && newSet.size === 1) {
          newSet.delete(id);
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Backlogs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez vos items par projet et par sprint
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <BacklogList
          title="Project Backlog"
          type="project"
          items={projectBacklogs}
          onAddRoot={(type) => {
            router.push(`/backlogs/new?type=${type}`);
          }}
          onEdit={(node) => {
            router.push(`/backlogs/${node.id}`);
          }}
          onDelete={deleteBacklog}
          onAddChild={(parent) => {
            router.push(
              `/backlogs/new?parentId=${parent.id}&type=${parent.type}`,
            );
          }}
          onHighlight={updateHighlight}
          onMoveUp={(id) => moveUp(id, "project")}
          onMoveDown={(id) => moveDown(id, "project")}
          onMoveBetweenLists={moveBetweenLists}
          selectedItems={selectedProjectItems}
          onSelectItem={handleSelectProjectItem}
        />

        <BacklogList
          title="Sprint Backlog"
          type="sprint"
          items={sprintBacklogs}
          onAddRoot={(type) => {
            router.push(`/backlogs/new?type=${type}`);
          }}
          onEdit={(node) => {
            router.push(`/backlogs/${node.id}`);
          }}
          onDelete={deleteBacklog}
          onAddChild={(parent) => {
            router.push(
              `/backlogs/new?parentId=${parent.id}&type=${parent.type}`,
            );
          }}
          onHighlight={updateHighlight}
          onMoveUp={(id) => moveUp(id, "sprint")}
          onMoveDown={(id) => moveDown(id, "sprint")}
          onMoveBetweenLists={moveBetweenLists}
          selectedItems={selectedSprintItems}
          onSelectItem={handleSelectSprintItem}
        />
      </div>
    </div>
  );
}
