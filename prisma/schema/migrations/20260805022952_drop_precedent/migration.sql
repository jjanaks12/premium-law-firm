/*
  Warnings:

  - You are about to drop the `case_precedents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "case_precedents" DROP CONSTRAINT "case_precedents_caseId_fkey";

-- DropTable
DROP TABLE "case_precedents";
