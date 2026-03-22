/*
  Warnings:

  - You are about to drop the column `source` on the `RSSFeed` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RSSFeed` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `RSSFeed` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RSSFeed" DROP CONSTRAINT "RSSFeed_userId_fkey";

-- AlterTable
ALTER TABLE "RSSFeed" DROP COLUMN "source",
DROP COLUMN "updatedAt",
ADD COLUMN     "sourceId" TEXT;

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RSSFeed_url_key" ON "RSSFeed"("url");

-- AddForeignKey
ALTER TABLE "RSSFeed" ADD CONSTRAINT "RSSFeed_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSSFeed" ADD CONSTRAINT "RSSFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
