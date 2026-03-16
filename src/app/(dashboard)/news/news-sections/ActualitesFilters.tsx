"use client";

import { Props } from "@/types/Props";

// Composant réutilisable pour les filtres de type select
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 h-[58px] flex items-center">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-none focus:ring-0 text-gray-900 p-0"
      >
        <option value="">{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default function ActualitesFilters({
  filters,
  setFilters,
  viewMode = "all",
  mediaOptions = [],
}: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Filtres sur UNE SEULE LIGNE avec hauteur uniforme */}
        <div className="grid grid-cols-12 gap-4">
          {/* FILTRE MÉDIA - Plus large */}
          {mediaOptions.length > 0 && (
            <div className="col-span-3">
              <FilterSelect
                label="Média"
                value={filters.mediaFilter || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilters({
                    ...filters,
                    mediaFilter: e.target.value || undefined,
                  })
                }
                options={mediaOptions}
                placeholder="Tous les médias"
              />
            </div>
          )}

          {/* Langue */}
          <div className="col-span-2">
            <FilterSelect
              label="Langue"
              value={filters.language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters({ ...filters, language: e.target.value })
              }
              options={[
                { value: "fr", label: "Français" },
                { value: "en", label: "Anglais" },
                { value: "ar", label: "Arabe" },
              ]}
              placeholder="Toutes"
            />
          </div>

          {/* Catégorie */}
          <div className="col-span-2">
            <FilterSelect
              label="Catégorie"
              value={filters.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters({ ...filters, category: e.target.value })
              }
              options={[
                { value: "politique", label: "Politique" },
                { value: "guerre", label: "Guerre" },
                { value: "economie", label: "Économie" },
              ]}
              placeholder="Toutes"
            />
          </div>

          {/* Mes intérêts + Enrôlement - Plus large */}
          <div className="col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes intérêts
            </label>
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 h-[58px] flex items-center justify-between">
              {/* Groupe des checkboxes standards */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filters.canada}
                    onChange={(e) =>
                      setFilters({ ...filters, canada: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Canada
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filters.quebec}
                    onChange={(e) =>
                      setFilters({ ...filters, quebec: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Québec
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filters.tunisia}
                    onChange={(e) =>
                      setFilters({ ...filters, tunisia: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Tunisie
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filters.portfolio}
                    onChange={(e) =>
                      setFilters({ ...filters, portfolio: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Portefeuille
                </label>
              </div>

              {/* Séparateur vertical */}
              <div className="w-px h-8 bg-gray-300 mx-1"></div>

              {/* Enrôlement - séparé à droite */}
              <label className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap font-medium px-1">
                <input
                  type="checkbox"
                  checked={filters.maRecherche || false}
                  onChange={(e) =>
                    setFilters({ ...filters, maRecherche: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enrôlement
              </label>
            </div>
          </div>
        </div>

        {/* Indicateur de filtre actif */}
        {filters.mediaFilter && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setFilters({ ...filters, mediaFilter: undefined })}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <span>✕ Réinitialiser le filtre média</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
