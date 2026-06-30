-- AlterTable
ALTER TABLE "Task" ADD COLUMN "code" TEXT NOT NULL DEFAULT 'TEMP';
UPDATE "Task" SET "code" = 'SKU-' || SUBSTRING("id", 1, 6) WHERE "code" = 'TEMP';
ALTER TABLE "Task" ALTER COLUMN "code" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Task_code_key" ON "Task"("code");