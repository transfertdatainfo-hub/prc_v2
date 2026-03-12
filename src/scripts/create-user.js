const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "user-1" },
    update: {},
    create: {
      id: "user-1",
      email: "test@example.com",
      name: "Utilisateur Test",
    },
  });

  console.log("Utilisateur créé/mis à jour:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
