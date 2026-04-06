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
  Rocket,
  CheckCircle,
  Clock,
  Play,
  XCircle,
  Pencil,
  Archive,
  History,
} from "lucide-react";

// Types de statuts
type Status =
  | "draft"
  | "ready"
  | "active"
  | "in_progress"
  | "done"
  | "cancelled";

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; icon: any }
> = {
  draft: {
    label: "En construction",
    color: "bg-gray-100 text-gray-600",
    icon: Pencil,
  },
  ready: {
    label: "Prêt",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  active: { label: "Actif", color: "bg-blue-100 text-blue-700", icon: Clock },
  in_progress: {
    label: "En cours",
    color: "bg-yellow-100 text-yellow-700",
    icon: Play,
  },
  done: {
    label: "Terminé",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulé",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

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

// Menu déroulant des statuts
function StatusDropdown({
  status,
  onStatusChange,
  disabled = false,
}: {
  status: Status;
  onStatusChange: (newStatus: Status) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
          STATUS_CONFIG[status].color
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {(() => {
          const Icon = STATUS_CONFIG[status].icon;
          return <Icon className="w-3 h-3" />;
        })()}
        <span>{STATUS_CONFIG[status].label}</span>
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[130px]">
          {(
            Object.entries(STATUS_CONFIG) as [
              Status,
              (typeof STATUS_CONFIG)[Status],
            ][]
          ).map(([value, config]) => (
            <button
              key={value}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs flex items-center gap-2 hover:bg-gray-100 ${
                status === value ? "bg-gray-50" : ""
              }`}
            >
              {(() => {
                const Icon = config.icon;
                return <Icon className="w-3 h-3" />;
              })()}
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant TreeNode pour le Product Backlog
function ProductTreeNode({
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
  onAssignToSprint,
  isInSprint,
  onStatusChange,
  sprintActive,
}: any) {
  const isExpanded = expandedNodes.has(node.id);
  const isDragOver = dragOverId === node.id;
  const hasHighlight = node.highlightColor;
  const Icon =
    TYPE_ICONS[node.backlogType as keyof typeof TYPE_ICONS] || Folder;
  const config = TYPE_CONFIG[node.backlogType as keyof typeof TYPE_CONFIG];

  return (
    <div>
      <div
        draggable={node.backlogType !== "folder" && sprintActive}
        onDragStart={(e) => {
          if (node.backlogType === "folder" || !sprintActive) {
            e.preventDefault();
            return;
          }
          e.stopPropagation();
          onDragStart(node.id, "product");
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
          onDrop(e, node.id, "product");
        }}
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer
          hover:bg-gray-100
          ${isDragOver ? "bg-blue-50 border-2 border-blue-300" : ""}
          ${hasHighlight ? "border-l-4" : ""}
          ${!sprintActive ? "opacity-60" : ""}
        `}
        style={{
          marginLeft: `${level * 20}px`,
          borderLeftColor: hasHighlight || undefined,
          backgroundColor: hasHighlight || undefined,
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

        <span className="flex-1 text-sm text-gray-700 flex items-center gap-2">
          {node.title}
          {isInSprint && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
              <Rocket className="w-3 h-3" />
              Sprint
            </span>
          )}
        </span>

        {/* Badge statut */}
        {node.backlogType !== "folder" && node.status && (
          <StatusDropdown
            status={node.status}
            onStatusChange={(newStatus: Status) =>
              onStatusChange(node.id, newStatus)
            }
            disabled={isInSprint}
          />
        )}

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

          {/* Bouton Affecter au Sprint - MODIFIÉ : tous les statuts sauf draft */}
          {sprintActive &&
            node.backlogType !== "folder" &&
            !isInSprint &&
            ["ready", "active", "in_progress", "done", "cancelled"].includes(
              node.status,
            ) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignToSprint(node);
                }}
                className="p-1 text-purple-400 hover:text-purple-600 rounded"
                title="Affecter au Sprint"
              >
                <Rocket className="w-3 h-3" />
              </button>
            )}

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
            <ProductTreeNode
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
              onAssignToSprint={onAssignToSprint}
              isInSprint={isInSprint}
              onStatusChange={onStatusChange}
              sprintActive={sprintActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

//ici
// Composant SprintItem (liste plate avec Drag & Drop)
function SprintItem({
  item,
  index,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverId,
  onStatusChange,
  sprintActive,
}: any) {
  const isDragOver = dragOverId === item.id;

  return (
    <div
      draggable={sprintActive}
      onDragStart={(e) => {
        if (!sprintActive) {
          e.preventDefault();
          return;
        }
        e.stopPropagation();
        onDragStart(item.id, "sprint");
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(e, item.id);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        onDragOver(null, null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(e, item.id, "sprint");
      }}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg transition-all bg-white border border-gray-200
        hover:bg-gray-50
        ${isDragOver ? "bg-blue-50 border-2 border-blue-300" : ""}
        ${!sprintActive ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-center gap-1 cursor-grab" title="Déplacer">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <span className="text-xs text-gray-400 w-6">{index + 1}</span>

      <span className="flex-1 text-sm text-gray-700">{item.title}</span>

      {/* Badge statut */}
      {item.status && (
        <StatusDropdown
          status={item.status}
          onStatusChange={(newStatus: Status) =>
            onStatusChange(item.id, newStatus)
          }
          disabled={!sprintActive}
        />
      )}

      <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1 text-gray-400 hover:text-blue-500 rounded"
          title="Modifier"
        >
          <Edit2 className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded"
          title="Retirer du Sprint"
        >
          <X className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(item.id);
          }}
          className="p-1 text-gray-400 hover:text-gray-700 rounded"
          title="Monter"
        >
          ↑
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(item.id);
          }}
          className="p-1 text-gray-400 hover:text-gray-700 rounded"
          title="Descendre"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

// Modal Historique des Sprints
function SprintHistoryModal({
  isOpen,
  onClose,
  sprints,
}: {
  isOpen: boolean;
  onClose: () => void;
  sprints: any[];
}) {
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [viewingItems, setViewingItems] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleViewSprint = async (sprint: any) => {
    setSelectedSprint(sprint);
    try {
      const res = await fetch(`/api/sprints/${sprint.id}/items`);
      const items = await res.json();
      setViewingItems(items);
    } catch (error) {
      console.error("Erreur chargement items:", error);
    }
  };

  const handleBack = () => {
    setSelectedSprint(null);
    setViewingItems([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "done":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "done":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedSprint
              ? `Sprint: ${selectedSprint.name}`
              : "Historique des Sprints"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedSprint ? (
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                ← Retour à l`&apos;historique
              </button>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Statut:</strong>{" "}
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedSprint.status)}`}
                  >
                    {getStatusLabel(selectedSprint.status)}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Créé le:</strong>{" "}
                  {new Date(selectedSprint.createdAt).toLocaleDateString(
                    "fr-FR",
                  )}
                </p>
                {selectedSprint.endedAt && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Terminé le:</strong>{" "}
                    {new Date(selectedSprint.endedAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Nombre d`&apos;items:</strong> {viewingItems.length}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 mb-2">
                  Items du Sprint:
                </h3>
                {viewingItems.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun item</p>
                ) : (
                  viewingItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700">
                          {item.title}
                        </span>
                      </div>
                      <StatusDropdown
                        status={item.status}
                        onStatusChange={() => {}}
                        disabled={true}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sprints.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Aucun sprint dans l&apos;historique
                </p>
              ) : (
                sprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    onClick={() => handleViewSprint(sprint)}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{sprint.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Créé le{" "}
                        {new Date(sprint.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs ${getStatusColor(sprint.status)}`}
                      >
                        {getStatusLabel(sprint.status)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant ProductBacklogList
function ProductBacklogList({
  items,
  onAddRoot,
  onEdit,
  onDelete,
  onAddChild,
  onHighlight,
  onMoveUp,
  onMoveDown,
  onMoveBetweenLists,
  onAssignToSprint,
  sprintItemIds,
  onStatusChange,
  sprintActive,
}: any) {
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
    if (dragItem.sourceType !== targetType) {
      onMoveBetweenLists([dragItem.id], targetType);
    }
    setDragItem(null);
  };

  const handleHighlightClick = (id: string) => {
    setHighlightTarget(highlightTarget === id ? null : id);
  };

  return (
    <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Folder className="w-5 h-5 text-amber-500" />
          Product Backlog
        </h2>
        <button
          onClick={() => onAddRoot("product")}
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
              onClick={() => onAddRoot("product")}
              className="mt-3 text-sm text-blue-500 hover:text-blue-600"
            >
              + Ajouter un item backlog
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((node: BacklogNode) => (
              <div key={node.id} className="relative">
                <ProductTreeNode
                  node={node}
                  level={0}
                  expandedNodes={expandedNodes}
                  onToggleExpand={toggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onHighlight={() => handleHighlightClick(node.id)}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverId={dragOverId}
                  onAssignToSprint={onAssignToSprint}
                  isInSprint={sprintItemIds?.has(node.id)}
                  onStatusChange={onStatusChange}
                  sprintActive={sprintActive}
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
    </div>
  );
}

// Composant SprintBacklogList
function SprintBacklogList({
  items,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReorder,
  onStatusChange,
  sprintActive,
  canCloseSprint,
  onCloseSprint,
}: any) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{
    id: string;
    sourceType: string;
  } | null>(null);

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

    if (dragItem.sourceType === "product") {
      // Venir du product backlog - l'item est déjà dans le sprint via assignToSprint
      console.log("Item du product backlog à ajouter au sprint via le bouton");
    } else if (dragItem.sourceType === "sprint" && dragItem.id !== targetId) {
      // Réorganisation interne du sprint backlog
      const oldIndex = items.findIndex((i: any) => i.id === dragItem.id);
      const newIndex = items.findIndex((i: any) => i.id === targetId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        onReorder(
          newItems.map((item: any, idx: number) => ({
            id: item.id,
            position: idx,
          })),
        );
      }
    }
    setDragItem(null);
  };

  return (
    <div className="w-1/2 bg-white flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-500" />
          Sprint Backlog
          {items.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({items.length} item{items.length > 1 ? "s" : ""})
            </span>
          )}
        </h2>
        {sprintActive && items.length > 0 && (
          <button
            onClick={onCloseSprint}
            disabled={!canCloseSprint}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              canCloseSprint
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            title={
              !canCloseSprint
                ? "Tous les items doivent être 'Terminé' ou 'Annulé'"
                : "Fermer le sprint"
            }
          >
            <Archive className="w-4 h-4" />
            Fermer le Sprint
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun item dans le sprint</p>
            <p className="text-sm mt-1">
              Affectez des items depuis le Product Backlog (bouton{" "}
              <Rocket className="w-3 h-3 inline" />)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: BacklogNode, index: number) => (
              <SprintItem
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit}
                onRemove={onRemove}
                onMoveUp={() => onMoveUp(item.id)}
                onMoveDown={() => onMoveDown(item.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragOverId={dragOverId}
                onStatusChange={onStatusChange}
                sprintActive={sprintActive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page principale
export default function BacklogsPage() {
  const router = useRouter();
  const [productBacklogs, setProductBacklogs] = useState<BacklogNode[]>([]);
  const [sprintItems, setSprintItems] = useState<BacklogNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [sprintStatus, setSprintStatus] = useState<string>("");
  const [sprintName, setSprintName] = useState<string>("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [closedSprints, setClosedSprints] = useState<any[]>([]);

  const fetchBacklogs = useCallback(async () => {
    try {
      // Récupérer tous les backlogs de type "product"
      const res = await fetch("/api/backlogs?type=product");
      const data = await res.json();
      setProductBacklogs(buildBacklogTree(data));

      // Récupérer le sprint actif
      const sprintRes = await fetch("/api/sprints/active");
      const sprint = await sprintRes.json();

      if (sprint && sprint.status === "active") {
        setSprintId(sprint.id);
        setSprintStatus(sprint.status);
        setSprintName(sprint.name);

        // Récupérer les items du sprint
        const sprintItemsRes = await fetch(`/api/sprints/${sprint.id}/items`);
        const sprintItemsData = await sprintItemsRes.json();
        setSprintItems(sprintItemsData || []);
      } else {
        setSprintItems([]);
        setSprintId(null);
        setSprintStatus("");
        setSprintName("");
      }

      // Récupérer l'historique des sprints fermés
      const historyRes = await fetch("/api/sprints/closed");
      const historyData = await historyRes.json();
      setClosedSprints(historyData);
    } catch (error) {
      console.error("Erreur chargement backlogs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBacklogs();
  }, [fetchBacklogs]);

  const openSprint = async () => {
    const name = prompt(
      "Nom du sprint:",
      `Sprint ${new Date().toLocaleDateString("fr-FR")}`,
    );
    if (!name) return;

    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newSprint = await res.json();
      setSprintId(newSprint.id);
      setSprintStatus("active");
      setSprintName(newSprint.name);
      setSprintItems([]);
      await fetchBacklogs();
    } catch (error) {
      console.error("Erreur ouverture sprint:", error);
    }
  };

  const assignToSprint = async (item: BacklogNode) => {
    if (!sprintId) {
      alert("Aucun sprint actif. Veuillez d'abord ouvrir un sprint.");
      return;
    }

    const alreadyInSprint = sprintItems.some((i) => i.id === item.id);
    if (alreadyInSprint) {
      alert("Cet item est déjà dans le sprint");
      return;
    }

    try {
      // Calculer le nouveau statut de l'item
      const newStatus = item.status === "ready" ? "active" : item.status;

      // Mettre à jour le statut si nécessaire
      if (newStatus !== item.status) {
        await fetch(`/api/backlogs/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      // Ajouter à la fin du sprint
      await fetch(`/api/sprints/${sprintId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backlogId: item.id,
          position: sprintItems.length,
        }),
      });

      await fetchBacklogs();
    } catch (error) {
      console.error("Erreur assignation:", error);
    }
  };

  const removeFromSprint = async (itemId: string) => {
    if (!sprintId) return;
    await fetch(`/api/sprints/${sprintId}/items/${itemId}`, {
      method: "DELETE",
    });
    await fetchBacklogs();
  };

  const reorderSprintItems = async (
    items: { id: string; position: number }[],
  ) => {
    if (!sprintId) return;
    await fetch(`/api/sprints/${sprintId}/items/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    await fetchBacklogs();
  };

  const moveSprintItemUp = async (id: string) => {
    const index = sprintItems.findIndex((item) => item.id === id);
    if (index <= 0) return;
    const newItems = [...sprintItems];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    await reorderSprintItems(
      newItems.map((item, idx) => ({ id: item.id, position: idx })),
    );
  };

  const moveSprintItemDown = async (id: string) => {
    const index = sprintItems.findIndex((item) => item.id === id);
    if (index === -1 || index >= sprintItems.length - 1) return;
    const newItems = [...sprintItems];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    await reorderSprintItems(
      newItems.map((item, idx) => ({ id: item.id, position: idx })),
    );
  };

  const updateStatus = async (id: string, status: Status) => {
    await fetch(`/api/backlogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchBacklogs();
  };

  const closeSprint = async () => {
    if (!sprintId) return;

    // Vérifier si tous les items sont clôturés (done ou cancelled)
    const canClose = sprintItems.every(
      (item) => item.status === "done" || item.status === "cancelled",
    );

    if (!canClose) {
      alert(
        "Impossible de clôturer le sprint : tous les items doivent être 'Terminé' ou 'Annulé'.",
      );
      return;
    }

    await fetch(`/api/sprints/${sprintId}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    setSprintId(null);
    setSprintItems([]);
    setSprintStatus("");
    setSprintName("");
    await fetchBacklogs();
  };

  const canCloseSprint =
    sprintItems.length > 0 &&
    sprintItems.every(
      (item) => item.status === "done" || item.status === "cancelled",
    );

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
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const moveBetweenLists = async (itemIds: string[], targetType: string) => {
    for (const id of itemIds) {
      if (targetType === "sprint") {
        const item = productBacklogs
          .flatMap((n) => {
            const flatten = (nodes: BacklogNode[]): BacklogNode[] => {
              let result: BacklogNode[] = [];
              nodes.forEach((node) => {
                result.push(node);
                if (node.children.length)
                  result = [...result, ...flatten(node.children)];
              });
              return result;
            };
            return flatten([n]);
          })
          .find((n) => n.id === id);
        if (item) await assignToSprint(item);
      }
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
    if (type === "sprint") {
      await moveSprintItemUp(id);
      return;
    }

    const list = productBacklogs;
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
    if (type === "sprint") {
      await moveSprintItemDown(id);
      return;
    }

    const list = productBacklogs;
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  const sprintActive = sprintId !== null && sprintStatus === "active";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Backlogs</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos items de développement. Les items &quot;Prêt&quot;
              peuvent être affectés au sprint.
            </p>
            {sprintActive && (
              <p className="text-sm text-purple-600 mt-1">
                Sprint actif: <strong>{sprintName}</strong>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Historique
            </button>
            {!sprintActive ? (
              <button
                onClick={openSprint}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Ouvrir un Sprint
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ProductBacklogList
          items={productBacklogs}
          onAddRoot={(type: string) => {
            router.push(`/backlogs/new?type=${type}`);
          }}
          onEdit={(node: BacklogNode) => {
            router.push(`/backlogs/${node.id}`);
          }}
          onDelete={deleteBacklog}
          onAddChild={(parent: BacklogNode) => {
            router.push(
              `/backlogs/new?parentId=${parent.id}&type=${parent.type}`,
            );
          }}
          onHighlight={updateHighlight}
          onMoveUp={(id: string) => moveUp(id, "product")}
          onMoveDown={(id: string) => moveDown(id, "product")}
          onMoveBetweenLists={moveBetweenLists}
          onAssignToSprint={assignToSprint}
          sprintItemIds={new Set(sprintItems.map((i) => i.id))}
          onStatusChange={updateStatus}
          sprintActive={sprintActive}
        />

        <SprintBacklogList
          items={sprintItems}
          onEdit={(node: BacklogNode) => {
            router.push(`/backlogs/${node.id}`);
          }}
          onRemove={removeFromSprint}
          onMoveUp={(id: string) => moveSprintItemUp(id)}
          onMoveDown={(id: string) => moveSprintItemDown(id)}
          onReorder={reorderSprintItems}
          onStatusChange={updateStatus}
          sprintActive={sprintActive}
          canCloseSprint={canCloseSprint}
          onCloseSprint={closeSprint}
        />
      </div>

      <SprintHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        sprints={closedSprints}
      />
    </div>
  );
}
