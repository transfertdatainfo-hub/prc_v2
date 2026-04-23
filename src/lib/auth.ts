// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Générer un code à 6 chiffres
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Stocker temporairement les codes (en production, utilisez Redis)
const verificationCodes = new Map<string, { code: string; expires: Date }>();

// Envoi d'email temporaire (console.log en dev)
async function sendVerificationEmail(email: string, code: string) {
  console.log(`📧 Code de vérification pour ${email}: ${code}`);
  if (process.env.NODE_ENV === "development") {
    console.log(`🔐 Votre code: ${code}`);
  }
  // TODO: Implémenter avec Resend en production
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        code: { label: "Code", type: "text" },
        step: { label: "Step", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email requis");
        }

        const step = credentials.step || "login";

        // ÉTAPE 1 : Vérification email/mot de passe
        if (step === "login") {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("Aucun compte associé à cet email");
          }

          // Vérifier le mot de passe (sauf pour les utilisateurs OAuth)
          if (user.password) {
            const isValid = await bcrypt.compare(
              credentials.password || "",
              user.password
            );
            if (!isValid) {
              throw new Error("Mot de passe incorrect");
            }
          } else {
            // Utilisateur OAuth, il doit utiliser son provider
            throw new Error(
              "Ce compte utilise Google/LinkedIn. Connectez-vous avec ce provider."
            );
          }

          // Générer et envoyer le code
          const code = generateVerificationCode();
          verificationCodes.set(credentials.email, {
            code,
            expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          });

          await sendVerificationEmail(credentials.email, code);

          // Retourner un objet spécial pour indiquer qu'on attend le code
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "free",
            image: user.image, // Ajout de l'image
            requiresCode: true,
          };
        }

        // ÉTAPE 2 : Vérification du code
        if (step === "verify") {
          const stored = verificationCodes.get(credentials.email);

          if (!stored) {
            throw new Error("Aucun code demandé. Retournez à la connexion.");
          }

          if (stored.expires < new Date()) {
            verificationCodes.delete(credentials.email);
            throw new Error("Code expiré. Veuillez vous reconnecter.");
          }

          if (stored.code !== credentials.code) {
            throw new Error("Code incorrect");
          }

          // Code valide, nettoyer et retourner l'utilisateur
          verificationCodes.delete(credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("Utilisateur non trouvé");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "free",
            image: user.image, // Ajout de l'image
          };
        }

        throw new Error("Étape invalide");
      },
    }),

    // Provider Google (optionnel - désactivé si pas de credentials)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Provider LinkedIn (optionnel - désactivé si pas de credentials)
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Premier appel : création du token à partir de l'utilisateur
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "free";
        token.image = (user as any).image || null; // Ajout de l'image
      }

      // Pour OAuth (Google/LinkedIn), récupérer l'image du profil
      if (account && profile) {
        if (account.provider === "google") {
          token.image = (profile as any).picture || null;
        }
        if (account.provider === "linkedin") {
          token.image = (profile as any).picture || null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.image as string | null; // Ajout de l'image
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};