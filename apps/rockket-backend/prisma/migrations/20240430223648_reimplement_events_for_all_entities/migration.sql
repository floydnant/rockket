BEGIN;

-- Rename enum to "TaskEventType"
ALTER TYPE "TaskEventUpdateField" RENAME TO "EntityEventType";
-- Rename/Add enum values
-- Any entity
ALTER TYPE "EntityEventType" ADD VALUE 'TITLE_CHANGED';
-- Tasklist
ALTER TYPE "EntityEventType" ADD VALUE 'LIST_PARENT_LIST_CHANGED';
-- Task
ALTER TYPE "EntityEventType" RENAME VALUE 'status' TO 'TASK_STATUS_CHANGED';
ALTER TYPE "EntityEventType" RENAME VALUE 'priority' TO 'TASK_PRIORITY_CHANGED';
ALTER TYPE "EntityEventType" RENAME VALUE 'deadline' TO 'TASK_DEADLINE_CHANGED';
ALTER TYPE "EntityEventType" ADD VALUE 'TASK_PARENT_TASK_CHANGED';
ALTER TYPE "EntityEventType" ADD VALUE 'TASK_PARENT_LIST_CHANGED';

-- Rename table 
ALTER TABLE "TaskEvent" RENAME TO "EntityEvent";
-- Rename table column
ALTER TABLE "EntityEvent" RENAME COLUMN "updatedField" TO "type";
-- Rename all values to their uppercase equivalent
UPDATE "EntityEvent"
SET "prevValue" = UPPER("prevValue")
WHERE "type" = 'TASK_STATUS_CHANGED' OR "type" = 'TASK_PRIORITY_CHANGED';
UPDATE "EntityEvent"
SET "newValue" = UPPER("newValue")
WHERE "type" = 'TASK_STATUS_CHANGED' OR "type" = 'TASK_PRIORITY_CHANGED';
-- Rename values from 'NOT_PLANNED' to 'DISCARDED'
UPDATE "EntityEvent"
SET "prevValue" = 'DISCARDED'
WHERE "prevValue" = 'NOT_PLANNED';
UPDATE "EntityEvent"
SET "newValue" = 'DISCARDED'
WHERE "newValue" = 'NOT_PLANNED';

-- Add table column "metaData"
ALTER TABLE "EntityEvent" ADD COLUMN "metaData" JSONB;
-- Populate "metaData"
UPDATE "EntityEvent"
SET "metaData" = jsonb_set(
  '{}'::jsonb,
  '{prevValue}',
  ('"' || "prevValue" || '"')::jsonb
);
UPDATE "EntityEvent"
SET "metaData" = jsonb_set(
  "metaData",
  '{newValue}',
  ('"' || "newValue" || '"')::jsonb
);
-- Remove old columns "prevValue" and "newValue", set "metaData" not null, drop "timestamp" default
ALTER TABLE "EntityEvent"
DROP COLUMN "newValue",
DROP COLUMN "prevValue",
ALTER COLUMN "metaData" SET NOT NULL,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- Relations
ALTER TABLE "EntityEvent" ADD COLUMN "listId" TEXT;
ALTER TABLE "EntityEvent" ALTER COLUMN "taskId" DROP NOT NULL;

ALTER TABLE "EntityEvent" RENAME CONSTRAINT "TaskEvent_pkey" TO "EntityEvent_pkey";

-- DropForeignKey to Task
ALTER TABLE "EntityEvent" DROP CONSTRAINT "TaskEvent_taskId_fkey";
-- AddForeignKey to Task (Delete event when task is deleted)
ALTER TABLE "EntityEvent"
ADD CONSTRAINT "EntityEvent_taskId_fkey"
FOREIGN KEY ("taskId")
REFERENCES "Task"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey to Tasklist (Delete event when list is deleted)
ALTER TABLE "EntityEvent"
ADD CONSTRAINT "EntityEvent_listId_fkey"
FOREIGN KEY ("listId")
REFERENCES "Tasklist"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- DropForeignKey to User
ALTER TABLE "EntityEvent" DROP CONSTRAINT "TaskEvent_userId_fkey";
-- AddForeignKey to User
ALTER TABLE "EntityEvent"
ADD CONSTRAINT "EntityEvent_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

COMMIT;
