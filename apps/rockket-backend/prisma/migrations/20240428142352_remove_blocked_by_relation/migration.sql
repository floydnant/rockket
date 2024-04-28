/*
  Warnings:

  - The values [blockedById] on the enum `TaskEventUpdateField` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blockedById` on the `Task` table. All the data in the column will be lost.

*/

-- Delete all TaskEvents that have the updatedField set to 'blockedById'
DELETE FROM "TaskEvent" WHERE "updatedField" = 'blockedById';

-- AlterEnum
BEGIN;
CREATE TYPE "TaskEventUpdateField_new" AS ENUM ('status', 'priority', 'deadline');
ALTER TABLE "TaskEvent" ALTER COLUMN "updatedField" TYPE "TaskEventUpdateField_new" USING ("updatedField"::text::"TaskEventUpdateField_new");
ALTER TYPE "TaskEventUpdateField" RENAME TO "TaskEventUpdateField_old";
ALTER TYPE "TaskEventUpdateField_new" RENAME TO "TaskEventUpdateField";
DROP TYPE "TaskEventUpdateField_old";
COMMIT;


-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_blockedById_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "blockedById";