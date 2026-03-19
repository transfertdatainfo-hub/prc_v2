// src/components/InterestFilterList.tsx
"use client";

import { useState, useEffect } from "react";
import { InterestFilter } from "@/types/InterestFilter";
import { Settings, Plus, Trash2, Edit, Check, X } from "lucide-react";

interface InterestFilterListProps {
  selectedFilters: string[]; // IDs des filtres actifs
  onFilterToggle: (filterId: string) => void;
  onOpenConfig: () => void;
}

export default function InterestFilterList({
  selectedFilters,
  onFilterToggle,
  onOpenConfig,
}: InterestFilterListProps) {
  const [filters, setFilters] = useState<InterestFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  // Charger les filtres au montage
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

  const handleAddFilter = async () => {
    if (!newLabel.trim() || !newKeywords.trim()) return;

    const keywordsList = newKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    try {
      const res = await fetch("/api/interest-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel.trim(),
          keywords: keywordsList,
        }),
      });

      if (res.ok) {
        const newFilter = await res.json();
        setFilters([...filters, newFilter]);
        setNewLabel("");
        setNewKeywords("");
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Erreur ajout filtre:", error);
    }
  };

  const handleUpdateFilter = async (filterId: string) => {
    if (!editLabel.trim() || !editKeywords.trim()) return;

    const keywordsList = editKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    try {
      const res = await fetch(`/api/interest-filters/${filterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel.trim(),
          keywords: keywordsList,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFilters(filters.map((f) => (f.id === filterId ? updated : f)));
        setEditingFilter(null);
      }
    } catch (error) {
      console.error("Erreur mise à jour filtre:", error);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm("Supprimer ce filtre ?")) return;

    try {
      const res = await fetch(`/api/interest-filters/${filterId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFilters(filters.filter((f) => f.id !== filterId));
        // Si le filtre était sélectionné, le désélectionner
        if (selectedFilters.includes(filterId)) {
          onFilterToggle(filterId); // Cela le désélectionnera
        }
      }
    } catch (error) {
      console.error("Erreur suppression filtre:", error);
    }
  };

  const startEditing = (filter: InterestFilter) => {
    setEditingFilter(filter.id);
    setEditLabel(filter.label);
    setEditKeywords(filter.keywords.map((k) => k.word).join(", "));
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Chargement des filtres...</div>
    );
  }

  return (
    <div className="space-y-3">
      {/* En-tête avec bouton configuration */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Mes filtres personnalisés
        </h3>
        <button
          onClick={onOpenConfig}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Configurer les filtres"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des filtres */}
      <div className="space-y-2">
        {filters.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Aucun filtre personnalisé
          </p>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className="group relative">
              {editingFilter === filter.id ? (
                // Mode édition
                <div className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Nom du filtre"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={editKeywords}
                    onChange={(e) => setEditKeywords(e.target.value)}
                    placeholder="Mots-clés (séparés par des virgules)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingFilter(null)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateFilter(filter.id)}
                      className="p-1 text-green-500 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Mode normal
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
                    className="flex-1 text-sm text-gray-700 cursor-pointer"
                    title={filter.keywords.map((k) => k.word).join(", ")}
                  >
                    {filter.label}
                  </label>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => startEditing(filter)}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bouton pour ajouter un nouveau filtre */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter un filtre
        </button>
      ) : (
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nom du filtre (ex: Enrôlement Canada)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <input
            type="text"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
            placeholder="Mots-clés (séparés par des virgules)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleAddFilter}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
