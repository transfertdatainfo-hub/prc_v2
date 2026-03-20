// src\app\(dashboard)\news\news-sections\CategoryView.tsx

"use client";

import { Article } from "@/types/Article";
import { Filters } from "@/types/Filters";
import { Construction } from "lucide-react"; // Icône de construction

interface CategoryViewProps {
  articles: Article[];
  filters: Filters;
  loading?: boolean;
}

export default function CategoryView({
  articles,
  filters,
  loading,
}: CategoryViewProps) {
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Message "En construction" */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          {/* Icône de construction */}
          <div className="mb-6 flex justify-center">
            <Construction className="w-20 h-20 text-amber-500" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🚧 En cours de construction 🚧
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            La vue &quot;Par catégorie&quot; est actuellement en développement.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block mx-auto">
            <p className="text-sm text-amber-700">
              <span className="font-semibold">Statut :</span> Bientôt disponible
            </p>
          </div>

          {/* Petit compteur pour montrer que les données sont là (optionnel) */}
          {!loading && (
            <p className="text-sm text-gray-400 mt-8">
              {articles.length} article{articles.length > 1 ? "s" : ""}{" "}
              disponible{articles.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Barre de progression stylisée (optionnelle) */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Développement</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-amber-500 h-2.5 rounded-full"
              style={{ width: "5%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
