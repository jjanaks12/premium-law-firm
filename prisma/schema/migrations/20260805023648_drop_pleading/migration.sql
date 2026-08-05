/*
  Warnings:

  - You are about to drop the `case_pleadings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "case_pleadings" DROP CONSTRAINT "case_pleadings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_pleadings" DROP CONSTRAINT "case_pleadings_pleaderUserId_fkey";

-- DropTable
DROP TABLE "case_pleadings";
