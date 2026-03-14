"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SummaryPage() {
  const params = useSearchParams();
  const jobId = params.get("jobId");

  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/summary-result?jobId=${jobId}`);
      const data = await res.json();
      setSummary(data.summary);
    })();
  }, [jobId]);

  if (!summary)
    return (
      <div className="p-8 text-center text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mx-auto mb-4" />
        Génération du résumé en cours...
      </div>
    );

  const lines = summary
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"));

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link href="/news" className="flex items-center gap-2 text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux articles
      </Link>

      <h1 className="text-2xl font-bold mb-6">Résumé des articles</h1>

      <ul className="space-y-4">
        {lines.map((line, i) => (
          <li key={i} className="bg-white p-4 rounded-lg shadow-sm border">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
