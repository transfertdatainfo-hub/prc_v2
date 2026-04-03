// src/app/(dashboard)/news/filters-config/FiltersConfigContent.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Trash2, Save, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { InterestFilter } from "@/types/InterestFilter";

// Type pour un bloc de mots-clés
type KeywordBlock = {
  id: string;
  keywords: string[];
  isExclusion: boolean;
};

export default function FiltersConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [filters, setFilters] = useState<InterestFilter[]>([]);
  const [loading, setLoading] = useState(true);

  // État pour le nouveau filtre
  const [filterName, setFilterName] = useState("");
  const [keywordBlocks, setKeywordBlocks] = useState<KeywordBlock[]>([
    { id: crypto.randomUUID(), keywords: [], isExclusion: false },
  ]);

  // États pour l'édition
  const [editingFilter, setEditingFilter] = useState<InterestFilter | null>(
    null,
  );

  // Références pour les champs de saisie des mots-clés
  const keywordInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {},
  );

  useEffect(() => {
    fetchFilters();
  }, []);

  // Si un ID d'édition est présent dans l'URL, charger ce filtre
  useEffect(() => {
    if (editId && filters.length > 0 && !editingFilter) {
      const filterToEdit = filters.find((f) => f.id === editId);
      if (filterToEdit) {
        startEditing(filterToEdit);
      }
    }
  }, [editId, filters, editingFilter]);

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

  // Vérifier si un bloc d'exclusion existe déjà
  const hasExclusionBlock = (blocks: KeywordBlock[]) => {
    return blocks.some((block) => block.isExclusion);
  };

  // Ajouter un nouveau bloc de mots-clés
  const addKeywordBlock = () => {
    const newBlock: KeywordBlock = {
      id: crypto.randomUUID(),
      keywords: [],
      isExclusion: false,
    };
    setKeywordBlocks([...keywordBlocks, newBlock]);
  };

  // Supprimer un bloc
  const removeKeywordBlock = (blockId: string) => {
    if (keywordBlocks.length === 1) return; // Garder au moins un bloc
    setKeywordBlocks(keywordBlocks.filter((block) => block.id !== blockId));
  };

  // Ajouter un mot-clé à un bloc
  const addKeywordToBlock = (blockId: string, keyword: string) => {
    if (!keyword.trim()) return;
    setKeywordBlocks(
      keywordBlocks.map((block) =>
        block.id === blockId
          ? { ...block, keywords: [...block.keywords, keyword.trim()] }
          : block,
      ),
    );
    // Réinitialiser le champ de saisie
    const input = keywordInputRefs.current[blockId];
    if (input) {
      input.value = "";
      input.focus();
    }
  };

  // Gérer la touche Entrée dans le champ de saisie
  const handleKeywordKeyDown = (
    blockId: string,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      if (input.value.trim()) {
        addKeywordToBlock(blockId, input.value);
      }
    }
  };

  // Supprimer un mot-clé d'un bloc
  const removeKeywordFromBlock = (blockId: string, index: number) => {
    setKeywordBlocks(
      keywordBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              keywords: block.keywords.filter((_, i) => i !== index),
            }
          : block,
      ),
    );
  };

  // Basculer le mode exclusion d'un bloc
  const toggleExclusion = (blockId: string) => {
    // Si on active l'exclusion sur ce bloc
    const block = keywordBlocks.find((b) => b.id === blockId);
    if (block && !block.isExclusion) {
      // Désactiver l'exclusion sur tous les autres blocs
      setKeywordBlocks(
        keywordBlocks.map((b) => ({
          ...b,
          isExclusion: b.id === blockId,
        })),
      );
    } else if (block && block.isExclusion) {
      // Si on désactive l'exclusion, aucun bloc n'a d'exclusion
      setKeywordBlocks(
        keywordBlocks.map((b) => ({
          ...b,
          isExclusion: false,
        })),
      );
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFilterName("");
    setKeywordBlocks([
      { id: crypto.randomUUID(), keywords: [], isExclusion: false },
    ]);
    setEditingFilter(null);
    // Rediriger vers la page sans paramètre edit
    router.replace("/news/filters-config");
  };

  // Créer un nouveau filtre
  const handleCreate = async () => {
    if (!filterName.trim()) {
      alert("Veuillez entrer un nom de filtre");
      return;
    }

    // Vérifier qu'il y a au moins un mot-clé
    const hasKeywords = keywordBlocks.some(
      (block) => block.keywords.length > 0,
    );
    if (!hasKeywords) {
      alert("Veuillez ajouter au moins un mot-clé");
      return;
    }

    // Vérifier qu'un seul bloc d'exclusion
    const exclusionBlocks = keywordBlocks.filter((block) => block.isExclusion);
    if (exclusionBlocks.length > 1) {
      alert("Un seul bloc d'exclusion est autorisé");
      return;
    }

    try {
      const res = await fetch("/api/interest-filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: filterName.trim(),
          blocks: keywordBlocks.map((block) => ({
            id: block.id,
            keywords: block.keywords,
            isExclusion: block.isExclusion,
          })),
        }),
      });

      if (res.ok) {
        const newFilter = await res.json();
        setFilters([newFilter, ...filters]);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création:", error);
      alert("Erreur de connexion");
    }
  };

  // Mettre à jour un filtre
  const handleUpdate = async () => {
    if (!editingFilter) return;
    if (!filterName.trim()) {
      alert("Veuillez entrer un nom de filtre");
      return;
    }

    const hasKeywords = keywordBlocks.some(
      (block) => block.keywords.length > 0,
    );
    if (!hasKeywords) {
      alert("Veuillez ajouter au moins un mot-clé");
      return;
    }

    const exclusionBlocks = keywordBlocks.filter((block) => block.isExclusion);
    if (exclusionBlocks.length > 1) {
      alert("Un seul bloc d'exclusion est autorisé");
      return;
    }

    try {
      const res = await fetch(`/api/interest-filters/${editingFilter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: filterName.trim(),
          blocks: keywordBlocks.map((block) => ({
            id: block.id,
            keywords: block.keywords,
            isExclusion: block.isExclusion,
          })),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFilters(
          filters.map((f) => (f.id === editingFilter.id ? updated : f)),
        );
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      alert("Erreur de connexion");
    }
  };

  // Supprimer un filtre
  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Supprimer le filtre "${label}" ?`)) return;

    try {
      const res = await fetch(`/api/interest-filters/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFilters(filters.filter((f) => f.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur de connexion");
    }
  };

  // Éditer un filtre existant (restaurer sa structure)
  const startEditing = (filter: InterestFilter) => {
    setEditingFilter(filter);
    setFilterName(filter.label);

    // Reconstruire les blocs à partir des données existantes
    let blocksFromFilter: KeywordBlock[] = [];

    if (
      filter.blocks &&
      Array.isArray(filter.blocks) &&
      filter.blocks.length > 0
    ) {
      // Utiliser les blocs existants
      blocksFromFilter = (filter.blocks as any[]).map((block: any) => ({
        id: block.id || crypto.randomUUID(),
        keywords: block.keywords || [],
        isExclusion: block.isExclusion || false,
      }));
    } else {
      // Fallback pour les anciens filtres : créer un bloc unique avec tous les mots-clés
      blocksFromFilter = [
        {
          id: crypto.randomUUID(),
          keywords: filter.keywords.map((k) => k.word),
          isExclusion: false,
        },
      ];
    }

    // S'assurer qu'il y a au moins un bloc
    if (blocksFromFilter.length === 0) {
      blocksFromFilter = [
        { id: crypto.randomUUID(), keywords: [], isExclusion: false },
      ];
    }

    setKeywordBlocks(blocksFromFilter);
  };

  const cancelEditing = () => {
    resetForm();
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
        {/* Formulaire de création/édition */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            {editingFilter ? "Modifier le filtre" : "Créer un nouveau filtre"}
          </h2>

          <div className="space-y-4">
            {/* Nom du filtre avec bouton + à droite */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du filtre
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="ex: Enrôlement Canada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <button
                onClick={addKeywordBlock}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="Ajouter un bloc de mots-clés"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Blocs de mots-clés */}
            <div className="space-y-4">
              {keywordBlocks.map((block, blockIndex) => (
                <div
                  key={block.id}
                  className={`border rounded-lg p-4 ${
                    block.isExclusion
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {/* En-tête du bloc */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <input
                        ref={(el) => {
                          keywordInputRefs.current[block.id] = el;
                        }}
                        type="text"
                        placeholder="Saisir un mot-clé"
                        onKeyDown={(e) => handleKeywordKeyDown(block.id, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const input = keywordInputRefs.current[block.id];
                        if (input && input.value.trim()) {
                          addKeywordToBlock(block.id, input.value);
                        }
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={block.isExclusion}
                        onChange={() => toggleExclusion(block.id)}
                        disabled={
                          !block.isExclusion && hasExclusionBlock(keywordBlocks)
                        }
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600">Exclusion</span>
                    </label>
                    {keywordBlocks.length > 1 && (
                      <button
                        onClick={() => removeKeywordBlock(block.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Corps du bloc : liste des mots-clés en tags */}
                  <div className="flex flex-wrap gap-2">
                    {block.keywords.map((keyword, kwIndex) => (
                      <span
                        key={kwIndex}
                        className="group inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-red-200"
                      >
                        {keyword}
                        <button
                          onClick={() =>
                            removeKeywordFromBlock(block.id, kwIndex)
                          }
                          className="ml-1 text-gray-400 group-hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {block.keywords.length === 0 && (
                      <span className="text-xs text-gray-400 italic">
                        Aucun mot-clé dans ce bloc
                      </span>
                    )}
                  </div>

                  {/* Indicateur de l'opérateur ET entre blocs (sauf pour le dernier) */}
                  {blockIndex < keywordBlocks.length - 1 && (
                    <div className="text-center text-sm text-gray-400 mt-3">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        ET
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bouton de création/sauvegarde */}
            <div className="flex justify-end gap-3 pt-4">
              {editingFilter && (
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={editingFilter ? handleUpdate : handleCreate}
                disabled={!filterName.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingFilter ? "Mettre à jour" : "Créer le filtre"}
              </button>
            </div>
          </div>
        </div>

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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {filter.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {filter.blocks && Array.isArray(filter.blocks)
                          ? filter.blocks.reduce(
                              (sum, block: any) =>
                                sum + (block.keywords?.length || 0),
                              0,
                            )
                          : filter.keywords.length}{" "}
                        mot
                        {filter.blocks &&
                        Array.isArray(filter.blocks) &&
                        filter.blocks.reduce(
                          (sum, block: any) =>
                            sum + (block.keywords?.length || 0),
                          0,
                        ) > 1
                          ? "s"
                          : ""}
                        -clé
                        {filter.blocks &&
                        Array.isArray(filter.blocks) &&
                        filter.blocks.reduce(
                          (sum, block: any) =>
                            sum + (block.keywords?.length || 0),
                          0,
                        ) > 1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(filter)}
                        className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                        title="Modifier"
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
                        onClick={() => handleDelete(filter.id, filter.label)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Aperçu des mots-clés avec structure des blocs */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filter.blocks && Array.isArray(filter.blocks)
                      ? (filter.blocks as any[]).map(
                          (block: any, blockIdx: number) => (
                            <div
                              key={blockIdx}
                              className="flex flex-wrap gap-1 items-center"
                            >
                              {block.keywords
                                ?.slice(0, 3)
                                .map((kw: string, kwIdx: number) => (
                                  <span
                                    key={kwIdx}
                                    className={`text-xs px-2 py-1 rounded ${
                                      block.isExclusion
                                        ? "bg-red-100 text-red-600 line-through"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {kw}
                                  </span>
                                ))}
                              {block.keywords?.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{block.keywords.length - 3}
                                </span>
                              )}
                              {blockIdx <
                                (filter.blocks as any[]).length - 1 && (
                                <span className="text-xs text-gray-400 mx-1">
                                  ET
                                </span>
                              )}
                            </div>
                          ),
                        )
                      : // Fallback pour les anciens filtres
                        filter.keywords.slice(0, 5).map((kw) => (
                          <span
                            key={kw.id}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {kw.word}
                          </span>
                        ))}
                    {filter.blocks &&
                      Array.isArray(filter.blocks) &&
                      (filter.blocks as any[]).some(
                        (b: any) => b.isExclusion,
                      ) && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          ⛔ Exclusion
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
