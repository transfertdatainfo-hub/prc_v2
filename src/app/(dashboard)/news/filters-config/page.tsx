// src/app/(dashboard)/news/filters-config/page.tsx

"use client";

import { useState, useEffect } from "react";
import { InterestFilter, InterestFilterInput } from "@/types/InterestFilter";
import { ArrowLeft, Plus, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FiltersConfigPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<InterestFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InterestFilterInput>({
    label: "",
    keywords: [],
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/interest-filters");
      const data = await res.json();
      setFilters(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!editForm.label || editForm.keywords.length === 0) return;

    try {
      const res = await fetch("/api/interest-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const newFilter = await res.json();
        setFilters([...filters, newFilter]);
        setEditForm({ label: "", keywords: [] });
        setEditingId(null);
      }
    } catch (error) {
      console.error("Erreur création:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.label || editForm.keywords.length === 0) return;

    try {
      const res = await fetch(`/api/interest-filters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setFilters(filters.map((f) => (f.id === id ? updated : f)));
        setEditingId(null);
        setEditForm({ label: "", keywords: [] });
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce filtre ?")) return;

    try {
      const res = await fetch(`/api/interest-filters/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFilters(filters.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setEditForm({
        ...editForm,
        keywords: [...editForm.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setEditForm({
      ...editForm,
      keywords: editForm.keywords.filter((_, i) => i !== index),
    });
  };

  const startEditing = (filter: InterestFilter) => {
    setEditingId(filter.id);
    setEditForm({
      label: filter.label,
      keywords: filter.keywords.map((k) => k.word),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ label: "", keywords: [] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Configuration des filtres personnalisés
          </h1>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Formulaire de création (quand aucun filtre en édition) */}
        {!editingId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Créer un nouveau filtre
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du filtre
                </label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) =>
                    setEditForm({ ...editForm, label: e.target.value })
                  }
                  placeholder="ex: Enrôlement Canada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mots-clés
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                    placeholder="Ajouter un mot-clé"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Liste des mots-clés */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {editForm.keywords.map((kw, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {kw}
                      <button
                        onClick={() => removeKeyword(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={!editForm.label || editForm.keywords.length === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Créer le filtre
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des filtres existants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Mes filtres ({filters.length})
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Chargement...</p>
          ) : filters.length === 0 ? (
            <p className="text-center text-gray-400 italic py-8">
              Aucun filtre personnalisé. Créez-en un !
            </p>
          ) : (
            <div className="space-y-4">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  {editingId === filter.id ? (
                    // Mode édition
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.label}
                        onChange={(e) =>
                          setEditForm({ ...editForm, label: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                          placeholder="Ajouter un mot-clé"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={addKeyword}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {editForm.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {kw}
                            <button
                              onClick={() => removeKeyword(idx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleUpdate(filter.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {filter.label}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {filter.keywords.length} mot
                            {filter.keywords.length > 1 ? "s" : ""}-clé
                            {filter.keywords.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(filter)}
                            className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          >
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(filter.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Aperçu des mots-clés */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {filter.keywords.slice(0, 5).map((kw) => (
                          <span
                            key={kw.id}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {kw.word}
                          </span>
                        ))}
                        {filter.keywords.length > 5 && (
                          <span className="text-xs text-gray-400">
                            +{filter.keywords.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
