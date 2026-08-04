/*
  Warnings:

  - You are about to drop the column `contactInfo` on the `case_parties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "case_parties" DROP COLUMN "contactInfo",
ADD COLUMN     "citizenshipNo" TEXT,
ADD COLUMN     "contactNo" TEXT,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "temporaryAddress" TEXT;
