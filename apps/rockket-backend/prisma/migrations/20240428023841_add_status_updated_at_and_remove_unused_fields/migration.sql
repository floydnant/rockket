/*
  Warnings:

  - You are about to drop the column `closedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `inProgressSince` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `Task` table. All the data in the column will be lost.
  - Added the required column `statusUpdatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
BEGIN;
ALTER TABLE "Task"
DROP COLUMN "closedAt",
DROP COLUMN "inProgressSince",
DROP COLUMN "openedAt",
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3);
UPDATE "Task" SET "statusUpdatedAt" = "createdAt";
ALTER TABLE "Task" ALTER COLUMN "statusUpdatedAt" SET NOT NULL;
COMMIT;
