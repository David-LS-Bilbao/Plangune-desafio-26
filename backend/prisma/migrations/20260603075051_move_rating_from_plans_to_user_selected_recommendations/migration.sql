/*
  Warnings:

  - You are about to drop the column `rating` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "rating";

-- AlterTable
ALTER TABLE "user_selected_recommendations" ADD COLUMN     "rating" INTEGER;
