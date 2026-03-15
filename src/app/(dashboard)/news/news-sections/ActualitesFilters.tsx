"use client";

import { Props } from "@/types/Props";

export default function ActualitesFilters({
  filters,
  setFilters,
  viewMode = "all",
  mediaOptions = [],
}: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* FILTRE MÉDIA - apparaît seulement s'il y a des médias */}
        {mediaOptions.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par média
                </label>
                <select
                  value={filters.mediaFilter || ""}
                  onChange={(e) => {
                    const newMediaFilter = e.target.value || undefined;
                    console.log(
                      "🎯 Nouveau filtre média sélectionné:",
                      newMediaFilter,
                    );
                    setFilters({ ...filters, mediaFilter: newMediaFilter });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Tous les médias</option>
                  {mediaOptions.map((media) => (
                    <option key={media.value} value={media.value}>
                      {media.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Indicateur de filtre actif */}
              {filters.mediaFilter && (
                <div className="flex items-end pb-2">
                  <button
                    onClick={() =>
                      setFilters({ ...filters, mediaFilter: undefined })
                    }
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <span>✕ Réinitialiser</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtres existants (langue, catégorie, intérêts) - INCHANGÉS */}
        <div className="grid grid-cols-4 gap-4">
          {/* Langue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Langue
            </label>
            <select
              value={filters.language}
              onChange={(e) =>
                setFilters({ ...filters, language: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Toutes</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="ar">Arabe</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Toutes</option>
              <option value="politique">Politique</option>
              <option value="guerre">Guerre</option>
              <option value="economie">Économie</option>
            </select>
          </div>

          {/* Cases à cocher */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes intérêts
            </label>

            <div className="flex items-center gap-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.canada}
                  onChange={(e) =>
                    setFilters({ ...filters, canada: e.target.checked })
                  }
                />
                Canada
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.quebec}
                  onChange={(e) =>
                    setFilters({ ...filters, quebec: e.target.checked })
                  }
                />
                Québec
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.tunisia}
                  onChange={(e) =>
                    setFilters({ ...filters, tunisia: e.target.checked })
                  }
                />
                Tunisie
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.portfolio}
                  onChange={(e) =>
                    setFilters({ ...filters, portfolio: e.target.checked })
                  }
                />
                Mon portefeuille financier
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
