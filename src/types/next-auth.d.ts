// src/types/next-auth.d.ts

import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    image?: string | null;  // Ajout de l'avatar
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;  // Ajout de l'avatar dans la session
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    image?: string | null;  // Ajout de l'avatar dans le JWT
  }
}