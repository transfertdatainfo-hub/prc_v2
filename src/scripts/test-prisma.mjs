import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

try {
  await prisma.$connect();
  console.log("✅ Connexion réussie");
  console.log("DATABASE_URL est défini:", !!process.env.DATABASE_URL);

  const count = await prisma.user.count();
  console.log(`Nombre d'utilisateurs: ${count}`);
} catch (error) {
  console.error("❌ Erreur:", error.message);
} finally {
  await prisma.$disconnect();
}
