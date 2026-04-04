"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Folder,
  GitBranch,
  CheckSquare,
  Save,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

type BacklogType = "folder" | "task" | "subtask";

const TYPE_CONFIG = {
  folder: {
    label: "Dossier",
    icon: Folder,
    description: "Peut contenir des tâches et sous-tâches",
    canHaveChildren: true,
    allowedChildren: ["task", "subtask"],
  },
  task: {
    label: "Tâche",
    icon: GitBranch,
    description: "Peut contenir des sous-tâches",
    canHaveChildren: true,
    allowedChildren: ["subtask"],
  },
  subtask: {
    label: "Sous-tâche",
    icon: CheckSquare,
    description: "Ne peut pas contenir d'éléments enfants",
    canHaveChildren: false,
    allowedChildren: [],
  },
};

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

// Composant Custom Select pour le parent avec icônes
function CustomParentSelect({ value, onChange, options, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
      >
        <span className="flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.type === "folder" && (
                <Folder className="w-4 h-4 text-amber-500" />
              )}
              {selectedOption.type === "task" && (
                <GitBranch className="w-4 h-4 text-blue-500" />
              )}
              {selectedOption.type === "subtask" && (
                <CheckSquare className="w-4 h-4 text-green-500" />
              )}
              <span className="text-gray-700">
                {selectedOption.indent}
                {selectedOption.title}
              </span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange({ target: { value: "" } });
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <span className="text-gray-500">-- Aucun parent (racine) --</span>
          </button>
          {options.map((opt: any) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChange({ target: { value: opt.id } });
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="whitespace-pre font-mono text-gray-400">
                {opt.indent}
              </span>
              {opt.type === "folder" && (
                <Folder className="w-4 h-4 text-amber-500" />
              )}
              {opt.type === "task" && (
                <GitBranch className="w-4 h-4 text-blue-500" />
              )}
              {opt.type === "subtask" && (
                <CheckSquare className="w-4 h-4 text-green-500" />
              )}
              <span className="text-gray-700">{opt.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Fonction pour construire l'arborescence
function buildBacklogTree(items: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByPosition = (nodes: any[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((node) => sortByPosition(node.children));
  };
  sortByPosition(roots);

  return roots;
}

export default function BacklogEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backlogType, setBacklogType] = useState<BacklogType>("task");
  const [type, setType] = useState<"project" | "sprint">("project");
  const [parentId, setParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [parentOptions, setParentOptions] = useState<any[]>([]);

  // Charger les données si on est en édition
  useEffect(() => {
    if (!isNew) {
      fetch(`/api/backlogs/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title);
          setDescription(data.description || "");
          setBacklogType(data.backlogType);
          setType(data.type);
          setParentId(data.parentId);
          setInitialLoading(false);
        })
        .catch((err) => {
          console.error("Erreur chargement:", err);
          setInitialLoading(false);
        });
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const parent = urlParams.get("parentId");
      const parentType = urlParams.get("type");
      if (parent) setParentId(parent);
      if (parentType === "project" || parentType === "sprint")
        setType(parentType);
      setInitialLoading(false);
    }
  }, [id, isNew]);

  // Charger les options de parent
  useEffect(() => {
    if (initialLoading) return;

    fetch(`/api/backlogs?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        const buildParentOptions = (items: any[], level = 0): any[] => {
          let options: any[] = [];
          items.forEach((item) => {
            if (item.id !== id) {
              options.push({
                id: item.id,
                title: item.title,
                type: item.backlogType,
                level: level,
                indent: "  ".repeat(level),
              });
              if (item.children && item.children.length > 0) {
                options.push(...buildParentOptions(item.children, level + 1));
              }
            }
          });
          return options;
        };

        const tree = buildBacklogTree(data);
        setParentOptions(buildParentOptions(tree));
      })
      .catch(console.error);
  }, [type, id, initialLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez entrer un titre");
      return;
    }

    setLoading(true);
    try {
      const url = isNew ? "/api/backlogs" : `/api/backlogs/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          backlogType,
          type,
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        router.push("/backlogs");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  const TypeIcon = TYPE_CONFIG[backlogType].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/backlogs")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux backlogs
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? "Créer un item backlog" : "Modifier l'item backlog"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Remplissez les informations ci-dessous
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d&apositem *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(TYPE_CONFIG) as BacklogType[]).map((t) => {
                const config = TYPE_CONFIG[t];
                const Icon = config.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBacklogType(t)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all cursor-pointer
                      ${
                        backlogType === t
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${backlogType === t ? "text-blue-500" : "text-gray-400"}`}
                    />
                    <div className="font-medium text-gray-800">
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {config.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type de backlog (Project ou Sprint) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backlog *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-black">
                <input
                  type="radio"
                  value="project"
                  checked={type === "project"}
                  onChange={(e) =>
                    setType(e.target.value as "project" | "sprint")
                  }
                  className="w-4 h-4 text-blue-500"
                />
                <span>Project Backlog</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-black">
                <input
                  type="radio"
                  value="sprint"
                  checked={type === "sprint"}
                  onChange={(e) =>
                    setType(e.target.value as "project" | "sprint")
                  }
                  className="w-4 h-4 text-blue-500"
                />
                <span>Sprint Backlog</span>
              </label>
            </div>
          </div>

          {/* Parent - avec Custom Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent
            </label>
            <CustomParentSelect
              value={parentId || ""}
              onChange={(e: any) => setParentId(e.target.value || null)}
              options={parentOptions}
              placeholder="-- Aucun parent (racine) --"
            />
            <p className="text-xs text-gray-400 mt-1">
              Les dossiers peuvent contenir des tâches et sous-tâches. Les
              tâches peuvent contenir des sous-tâches. Les sous-tâches ne
              peuvent rien contenir.
            </p>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implémenter l'authentification"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée de l'item..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/backlogs")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isNew ? "Créer" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
