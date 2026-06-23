/*
  Warnings:

  - You are about to drop the column `priority` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
ADD COLUMN     "cantidad" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "precio" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
