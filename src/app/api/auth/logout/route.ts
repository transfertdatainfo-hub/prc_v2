// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Non connecté" },
        { status: 401 }
      );
    }

    // NextAuth gère la déconnexion via le signOut côté client
    // Cette API est utile pour des logs ou nettoyages supplémentaires
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur logout:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}