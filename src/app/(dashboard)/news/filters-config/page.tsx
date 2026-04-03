// src/app/(dashboard)/news/filters-config/page.tsx

import { Suspense } from "react";
import FiltersConfigContent from "./FiltersConfigContent";

export default function FiltersConfigPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <FiltersConfigContent />
    </Suspense>
  );
}
