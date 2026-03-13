/*
  Warnings:

  - You are about to drop the `WebFeed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WebFeed";

-- CreateTable
CREATE TABLE "WEBFeed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WEBFeed_pkey" PRIMARY KEY ("id")
);
