/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `RSSFeed` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `RSSFeed` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RSSFeed" DROP CONSTRAINT "RSSFeed_userId_fkey";

-- AlterTable
ALTER TABLE "RSSFeed" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RSSFeed" ADD CONSTRAINT "RSSFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
