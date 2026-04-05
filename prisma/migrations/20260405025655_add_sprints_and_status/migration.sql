-- AlterTable
ALTER TABLE "backlogs" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE "sprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_items" (
    "id" TEXT NOT NULL,
    "sprint_id" TEXT NOT NULL,
    "backlog_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sprint_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sprint_items_sprint_id_backlog_id_key" ON "sprint_items"("sprint_id", "backlog_id");

-- AddForeignKey
ALTER TABLE "sprint_items" ADD CONSTRAINT "sprint_items_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_items" ADD CONSTRAINT "sprint_items_backlog_id_fkey" FOREIGN KEY ("backlog_id") REFERENCES "backlogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
