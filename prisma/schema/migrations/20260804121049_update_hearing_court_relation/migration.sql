/*
  Warnings:

  - You are about to drop the column `judgeName` on the `case_hearings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "case_hearings" DROP COLUMN "judgeName",
ADD COLUMN     "caseCourtDetailId" TEXT;

-- AddForeignKey
ALTER TABLE "case_hearings" ADD CONSTRAINT "case_hearings_caseCourtDetailId_fkey" FOREIGN KEY ("caseCourtDetailId") REFERENCES "case_court_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;
