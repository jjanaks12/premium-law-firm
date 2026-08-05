/*
  Warnings:

  - You are about to drop the column `relatedLaws` on the `cases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cases" DROP COLUMN "relatedLaws",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "relatedLaw" JSONB;
