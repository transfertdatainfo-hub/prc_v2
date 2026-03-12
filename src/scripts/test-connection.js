require("dotenv").config();

console.log("=== Test de configuration ===");
console.log("DATABASE_URL défini:", !!process.env.DATABASE_URL);
console.log(
  "DATABASE_URL commence par:",
  process.env.DATABASE_URL?.substring(0, 20) + "...",
);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Connexion à PostgreSQL réussie!");

    // Test simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Query test réussie:", result);

    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`✅ Nombre d'utilisateurs dans la base: ${userCount}`);
  } catch (error) {
    console.error("❌ Erreur de connexion:");
    console.error("Message:", error.message);

    if (error.message.includes("P1001")) {
      console.error("\n⚠️  PostgreSQL n'est pas accessible. Vérifiez que:");
      console.error("   1. PostgreSQL est démarré");
      console.error(
        "   2. Les informations de connexion dans .env sont correctes",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
