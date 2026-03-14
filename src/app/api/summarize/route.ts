import { NextResponse } from "next/server";
import { summaryQueue } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const { articles } = await req.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { error: "Aucun article à résumer" },
        { status: 400 }
      );
    }

    // Ajouter à la queue au lieu d'appeler directement
    const summary = await summaryQueue.add(articles);

    const jobId = crypto.randomUUID();
    
    if (!globalThis.summaryStore) {
      globalThis.summaryStore = new Map();
    }
    
    globalThis.summaryStore.set(jobId, summary);

    return NextResponse.json({ jobId });

  } catch (error: any) {
    console.error("Erreur:", error);
    
    // Si c'est une erreur 429, la transmettre
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Trop de requêtes, veuillez réessayer plus tard" },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}