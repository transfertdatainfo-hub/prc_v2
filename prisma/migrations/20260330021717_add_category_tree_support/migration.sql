/*
  Warnings:

  - You are about to drop the column `createdAt` on the `interest_filters` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `interest_filters` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `interest_filters` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `keywords` table. All the data in the column will be lost.
  - You are about to drop the column `filterId` on the `keywords` table. All the data in the column will be lost.
  - You are about to drop the `RSSFeed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,label]` on the table `interest_filters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `interest_filters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `interest_filters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filter_id` to the `keywords` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RSSFeed" DROP CONSTRAINT "RSSFeed_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "RSSFeed" DROP CONSTRAINT "RSSFeed_userId_fkey";

-- DropForeignKey
ALTER TABLE "interest_filters" DROP CONSTRAINT "interest_filters_userId_fkey";

-- DropForeignKey
ALTER TABLE "keywords" DROP CONSTRAINT "keywords_filterId_fkey";

-- DropIndex
DROP INDEX "interest_filters_userId_label_key";

-- DropIndex
DROP INDEX "keywords_filterId_word_key";

-- AlterTable
ALTER TABLE "interest_filters" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "keywords" DROP COLUMN "createdAt",
DROP COLUMN "filterId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filter_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "RSSFeed";

-- DropTable
DROP TABLE "Source";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rss_feeds" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "user_id" TEXT NOT NULL,
    "source_id" TEXT,
    "parent_id" TEXT,
    "node_type" TEXT NOT NULL DEFAULT 'feed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rss_feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rss_feeds_user_id_url_key" ON "rss_feeds"("user_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "interest_filters_user_id_label_key" ON "interest_filters"("user_id", "label");

-- AddForeignKey
ALTER TABLE "rss_feeds" ADD CONSTRAINT "rss_feeds_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rss_feeds" ADD CONSTRAINT "rss_feeds_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "rss_feeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "interest_filters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
