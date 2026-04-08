"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Backlog } from "@/types/Backlog";

type BacklogType = "folder" | "task" | "subtask";

export default function BacklogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backlogType, setBacklogType] = useState<BacklogType>("task");
  const [status, setStatus] = useState<string>("draft");
  const [parentId, setParentId] = useState<string | null>(null);

  // NOUVEAU : Type d'item (Product Backlog ou Sprint Backlog)
  const [itemType, setItemType] = useState<"product" | "sprint">("product");

  // NOUVEAU : Vérifier si un sprint est actif
  const [sprintActive, setSprintActive] = useState<any>(null);
  const [parents, setParents] = useState<Backlog[]>([]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger le backlog existant si ce n'est pas un nouveau
        if (id !== "new") {
          const res = await fetch(`/api/backlogs/${id}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title);
            setDescription(data.description || "");
            setBacklogType(data.backlogType);
            setStatus(data.status);
            setParentId(data.parentId || null);
            // Récupérer le type existant
            if (data.type) {
              setItemType(data.type);
            }
          }
        }

        // Charger la liste des parents possibles
        const parentsRes = await fetch("/api/backlogs?type=product");
        const parentsData = await parentsRes.json();
        setParents(parentsData.filter((p: Backlog) => p.id !== id));

        // NOUVEAU : Vérifier si un sprint est actif
        const sprintRes = await fetch("/api/sprints/active");
        const sprint = await sprintRes.json();
        setSprintActive(sprint);
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Le titre est requis");
      return;
    }

    setSaving(true);
    try {
      const method = id === "new" ? "POST" : "PUT";
      const url = id === "new" ? "/api/backlogs" : `/api/backlogs/${id}`;

      const body: any = {
        title: title.trim(),
        description: description.trim() || null,
        backlogType,
        status,
        parentId: parentId || null,
        type: itemType, // NOUVEAU : envoyer le type
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/backlogs");
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cet item définitivement ?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/backlogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/backlogs");
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "En construction",
      ready: "Prêt",
      active: "Actif",
      in_progress: "En cours",
      done: "Terminé",
      cancelled: "Annulé",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {id === "new" ? "Nouvel item" : "Modifier l'item"}
            </h1>
            {id !== "new" && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Titre de l'item"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Description détaillée..."
              />
            </div>

            {/* Type d'item (folder/task/subtask) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d&apos;item
              </label>
              <div className="flex gap-4">
                {(["folder", "task", "subtask"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      checked={backlogType === type}
                      onChange={() => setBacklogType(type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {type === "folder" && "📁 Dossier"}
                      {type === "task" && "✅ Tâche"}
                      {type === "subtask" && "📌 Sous-tâche"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ============================================================ */}
            {/* NOUVEAU : Type de backlog (Product ou Sprint) */}
            {/* ============================================================ */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Affectation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="product"
                    checked={itemType === "product"}
                    onChange={() => setItemType("product")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Product Backlog</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="sprint"
                    checked={itemType === "sprint"}
                    onChange={() => setItemType("sprint")}
                    disabled={!sprintActive}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">Sprint Backlog</span>
                </label>
              </div>
              {!sprintActive && (
                <p className="text-xs text-amber-600">
                  ⚠️ Aucun sprint actif. L&apos;option &quot;Sprint
                  Backlog&quot; est désactivée. Ouvrez d&apos;abord un sprint
                  depuis la page Backlogs.
                </p>
              )}
              {sprintActive && (
                <p className="text-xs text-green-600">
                  ✅ Sprint actif: <strong>{sprintActive.name}</strong>
                </p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="draft">📝 En construction</option>
                <option value="ready">✅ Prêt</option>
                <option value="active">🟢 Actif</option>
                <option value="in_progress">🔄 En cours</option>
                <option value="done">✔️ Terminé</option>
                <option value="cancelled">❌ Annulé</option>
              </select>
            </div>

            {/* Parent (pour l'arborescence) */}
            {parents.length > 0 && backlogType !== "folder" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent
                </label>
                <select
                  value={parentId || ""}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">(Aucun parent - racine)</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Informations supplémentaires */}
            {id !== "new" && (
              <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
                <p>ID: {id}</p>
                <p>Statut actuel: {getStatusLabel(status)}</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/backlogs")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
