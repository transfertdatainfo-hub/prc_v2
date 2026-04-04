-- CreateTable
CREATE TABLE "backlogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "user_id" TEXT NOT NULL,
    "highlight_color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backlogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backlogs_user_id_title_parent_id_key" ON "backlogs"("user_id", "title", "parent_id");

-- AddForeignKey
ALTER TABLE "backlogs" ADD CONSTRAINT "backlogs_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "backlogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
