/*
  Warnings:

  - The values [Status,Priority,Deadline,BlockedBy] on the enum `TaskEventUpdateField` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskEventUpdateField_new" AS ENUM ('status', 'priority', 'deadline', 'blockedById');
ALTER TABLE "TaskEvent" ALTER COLUMN "updatedField" TYPE "TaskEventUpdateField_new" USING ("updatedField"::text::"TaskEventUpdateField_new");
ALTER TYPE "TaskEventUpdateField" RENAME TO "TaskEventUpdateField_old";
ALTER TYPE "TaskEventUpdateField_new" RENAME TO "TaskEventUpdateField";
DROP TYPE "TaskEventUpdateField_old";
COMMIT;
