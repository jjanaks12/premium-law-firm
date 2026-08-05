/*
  Warnings:

  - You are about to drop the `case_counselings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "case_counselings" DROP CONSTRAINT "case_counselings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_counselings" DROP CONSTRAINT "case_counselings_counselorUserId_fkey";

-- DropTable
DROP TABLE "case_counselings";
