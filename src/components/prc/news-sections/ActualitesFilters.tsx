"use client";

type Filters = {
  language: string;
  category: string;
  canada: boolean;
  quebec: boolean;
  tunisia: boolean;
  portfolio: boolean;
};

type Props = {
  filters: Filters;
  setFilters: (f: Filters) => void;
};

export default function ActualitesFilters({ filters, setFilters }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
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
  );
}
