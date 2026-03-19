// src/app/(dashboard)/news/news-sections/ActualitesFilters.tsx
"use client";

import { Props } from "@/types/Props";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [interestFilters, setInterestFilters] = useState<any[]>([]);

  // Charger les filtres d'intérêts
  useEffect(() => {
    const fetchInterestFilters = async () => {
      try {
        const res = await fetch("/api/interest-filters");
        const data = await res.json();
        setInterestFilters(data);
      } catch (error) {
        console.error("Erreur chargement filtres:", error);
      }
    };
    fetchInterestFilters();
  }, []);

  // Gestionnaire pour activer/désactiver un filtre personnalisé
  const handleFilterChange = (filterId: string) => {
    const current = filters.activeInterestFilters || [];
    const newActive = current.includes(filterId)
      ? current.filter((id) => id !== filterId)
      : [...current, filterId];

    setFilters({
      ...filters,
      activeInterestFilters: newActive,
    });
  };

  // Transformer les filtres en options pour le select
  const filterOptions = [
    { value: "", label: "Aucun filtre" },
    ...interestFilters.map((filter) => ({
      value: filter.id,
      label: filter.label,
    })),
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Filtres sur UNE SEULE LIGNE */}
        <div className="grid grid-cols-12 gap-4">
          {/* FILTRE MÉDIA */}
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

          {/* FILTRES PERSONNALISÉS - NEUMORPHISM EXACT */}
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes filtres personnalisés
            </label>
            <div className="flex gap-2">
              {/* Combobox avec flèche */}
              <div className="relative flex-1">
                <select
                  value={filters.activeInterestFilters?.[0] || ""}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg text-gray-900 p-3 pr-10 h-[58px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* BOUTON NEUMORPHISM - CHANGE SELON ÉTAT */}
              <button
                onClick={() => router.push("/news/filters-config")}
                className="w-[58px] h-[58px] flex items-center justify-center rounded-2xl bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  boxShadow:
                    interestFilters.length === 0
                      ? "8px 8px 16px rgba(0,0,0,0.05), -8px -8px 16px #ffffff"
                      : "inset 3px 3px 7px rgba(0,0,0,0.05), inset -3px -3px 7px #ffffff",
                }}
                title={
                  interestFilters.length === 0
                    ? "Créer des filtres"
                    : "Gérer les filtres"
                }
              >
                {interestFilters.length === 0 ? (
                  // ✅ ICONE VIDE (image 1)
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <circle cx="10" cy="6" r="2" />

                    <line x1="4" y1="12" x2="20" y2="12" />
                    <circle cx="15" cy="12" r="2" />

                    <line x1="4" y1="18" x2="20" y2="18" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                ) : (
                  // ✅ ICONE PLEINE (image 2)
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="#3B82F6"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" stroke="#9CA3AF" />
                    <circle cx="10" cy="6" r="2" />

                    <line x1="4" y1="12" x2="20" y2="12" stroke="#9CA3AF" />
                    <circle cx="15" cy="12" r="2" />

                    <line x1="4" y1="18" x2="20" y2="18" stroke="#9CA3AF" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Indicateurs de filtres actifs */}
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
