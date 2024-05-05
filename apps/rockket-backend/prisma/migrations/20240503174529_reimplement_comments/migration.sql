/*
  Warnings:

  - You are about to drop the `TaskComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EntityCommentType" AS ENUM ('TASK_COMMENT', 'TASKLIST_COMMENT');

-- DropForeignKey
ALTER TABLE "TaskComment" DROP CONSTRAINT "TaskComment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskComment" DROP CONSTRAINT "TaskComment_userId_fkey";

-- DropTable
DROP TABLE "TaskComment";

-- CreateTable
CREATE TABLE "entity_comments" (
    "id" TEXT NOT NULL,
    "type" "EntityCommentType" NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "parent_comment_id" TEXT,
    "task_id" TEXT,
    "list_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "entity_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "entity_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "Tasklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
