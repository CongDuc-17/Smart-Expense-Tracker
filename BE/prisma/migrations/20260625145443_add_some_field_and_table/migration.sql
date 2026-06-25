/*
  Warnings:

  - You are about to drop the column `createdAt` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `image_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `suggestedCategory` on the `image_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `image_analyses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `incomes` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `incomes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `incomes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ocr_results` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ocr_results` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `saving_goals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `saving_goals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,type,userId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refresh_token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `image_analyses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `incomes` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `ocr_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `saving_goals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('BUDGET_WARNING', 'BUDGET_EXCEEDED', 'GOAL_REACHED', 'AI_INSIGHT', 'SYSTEM');

-- DropIndex
DROP INDEX "categories_name_type_key";

-- DropIndex
DROP INDEX "notifications_userId_isRead_idx";

-- DropIndex
DROP INDEX "refresh_tokens_refreshToken_key";

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "spent_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "createdAt",
DROP COLUMN "isDefault",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "imageUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "image_public_id" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "image_analyses" DROP COLUMN "createdAt",
DROP COLUMN "suggestedCategory",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suggested_category_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "incomes" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "read_at" TIMESTAMP(3),
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "ocr_results" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "raw_response" JSONB,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "refresh_token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "saving_goals" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_public_id" TEXT;

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saving_deposits" (
    "id" TEXT NOT NULL,
    "saving_goal_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "deposited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saving_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_insights_userId_month_year_idx" ON "ai_insights"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ai_insights_userId_month_year_key" ON "ai_insights"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "saving_deposits_saving_goal_id_idx" ON "saving_deposits"("saving_goal_id");

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_userId_key" ON "categories"("name", "type", "userId");

-- CreateIndex
CREATE INDEX "expenses_userId_date_categoryId_idx" ON "expenses"("userId", "date", "categoryId");

-- CreateIndex
CREATE INDEX "incomes_userId_categoryId_idx" ON "incomes"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "notifications_userId_is_read_idx" ON "notifications"("userId", "is_read");

-- CreateIndex
CREATE INDEX "notifications_userId_created_at_idx" ON "notifications"("userId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_refresh_token_key" ON "refresh_tokens"("refresh_token");

-- AddForeignKey
ALTER TABLE "image_analyses" ADD CONSTRAINT "image_analyses_suggested_category_id_fkey" FOREIGN KEY ("suggested_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saving_deposits" ADD CONSTRAINT "saving_deposits_saving_goal_id_fkey" FOREIGN KEY ("saving_goal_id") REFERENCES "saving_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
