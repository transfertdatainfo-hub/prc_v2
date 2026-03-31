// src/scripts/migrate.js
// Exécuter avec: node src/scripts/migrate.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrate() {
  console.log("🔄 Migration des flux RSS...");

  try {
    const result = await prisma.$executeRaw`
      UPDATE rss_feeds 
      SET node_type = 'feed' 
      WHERE node_type IS NULL OR node_type = ''
    `;

    console.log(`✅ ${result} flux mis à jour`);

    // Vérifier le résultat
    const stats = await prisma.$queryRaw`
      SELECT 
        node_type,
        COUNT(*) as count
      FROM rss_feeds 
      GROUP BY node_type
    `;

    console.log("\n📊 Répartition actuelle:");
    if (stats && Array.isArray(stats)) {
      stats.forEach((row) => {
        console.log(`   ${row.node_type}: ${row.count}`);
      });
    }
  } catch (err) {
    console.error("❌ Erreur:", err?.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
