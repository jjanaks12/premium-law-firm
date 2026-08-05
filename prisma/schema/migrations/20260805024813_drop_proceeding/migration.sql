/*
  Warnings:

  - You are about to drop the `court_proceedings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "court_proceedings" DROP CONSTRAINT "court_proceedings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "court_proceedings" DROP CONSTRAINT "court_proceedings_courtLevelId_fkey";

-- DropTable
DROP TABLE "court_proceedings";
