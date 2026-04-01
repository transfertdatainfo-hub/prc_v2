// src/components/InterestFilterList.tsx

"use client";

import { useState, useEffect } from "react";
import { InterestFilter } from "@/types/InterestFilter";
import { Settings, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface InterestFilterListProps {
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onOpenConfig: () => void;
}

export default function InterestFilterList({
  selectedFilters,
  onFilterToggle,
  onOpenConfig,
}: InterestFilterListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<InterestFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/interest-filters");
      const data = await res.json();
      setFilters(data);
    } catch (error) {
      console.error("Erreur chargement filtres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilter = async (filterId: string, label: string) => {
    if (!confirm(`Supprimer le filtre "${label}" ?`)) return;

    try {
      const res = await fetch(`/api/interest-filters/${filterId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFilters(filters.filter((f) => f.id !== filterId));
        if (selectedFilters.includes(filterId)) {
          onFilterToggle(filterId);
        }
      }
    } catch (error) {
      console.error("Erreur suppression filtre:", error);
    }
  };

  const getKeywordsDisplay = (filter: InterestFilter): string => {
    // Si le filtre a des blocs, afficher un aperçu
    if (filter.blocks && Array.isArray(filter.blocks)) {
      const allKeywords = filter.blocks.flatMap((block: any) => block.keywords);
      return allKeywords.slice(0, 5).join(", ");
    }
    // Fallback pour les anciens filtres
    return filter.keywords
      .map((k) => k.word)
      .slice(0, 5)
      .join(", ");
  };

  const getKeywordsCount = (filter: InterestFilter): number => {
    if (filter.blocks && Array.isArray(filter.blocks)) {
      return filter.blocks.reduce(
        (sum, block: any) => sum + block.keywords.length,
        0,
      );
    }
    return filter.keywords.length;
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Chargement des filtres...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Mes filtres personnalisés
        </h3>
        <button
          onClick={() => router.push("/news/filters-config")}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Configurer les filtres"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {filters.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Aucun filtre personnalisé
          </p>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className="group relative">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`filter-${filter.id}`}
                  checked={selectedFilters.includes(filter.id)}
                  onChange={() => onFilterToggle(filter.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`filter-${filter.id}`}
                  className="flex-1 text-sm text-gray-700 cursor-pointer truncate"
                  title={getKeywordsDisplay(filter)}
                >
                  {filter.label}
                  <span className="text-xs text-gray-400 ml-1">
                    ({getKeywordsCount(filter)} mot
                    {getKeywordsCount(filter) > 1 ? "s" : ""})
                  </span>
                </label>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() =>
                      router.push(`/news/filters-config?edit=${filter.id}`)
                    }
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    title="Modifier"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter.id, filter.label)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
