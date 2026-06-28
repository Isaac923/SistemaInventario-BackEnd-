/*
  Warnings:

  - You are about to drop the column `cantidad` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Task` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropIndex
DROP INDEX "Task_code_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "cantidad",
DROP COLUMN "code",
DROP COLUMN "precio",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
