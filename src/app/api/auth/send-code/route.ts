// src/app/api/auth/send-code/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fonction pour générer un code (identique à celle dans auth.ts)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Stockage temporaire (en production, utiliser Redis)
const verificationCodes = new Map<string, { code: string; expires: Date }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Aucun compte associé à cet email" },
        { status: 404 }
      );
    }

    // Générer le code
    const code = generateVerificationCode();
    verificationCodes.set(email, {
      code,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Envoyer l'email
    console.log(`📧 Code pour ${email}: ${code}`);

    return NextResponse.json({
      message: "Code envoyé",
      expiresIn: 600, // 10 minutes en secondes
    });
  } catch (error) {
    console.error("Erreur envoi code:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du code" },
      { status: 500 }
    );
  }
}