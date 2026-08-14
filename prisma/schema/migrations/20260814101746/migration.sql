-- AlterTable
ALTER TABLE "case_court_details" ADD COLUMN     "courtLevelId" TEXT;

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "relatedPrecedents" JSONB;

-- AddForeignKey
ALTER TABLE "case_court_details" ADD CONSTRAINT "case_court_details_courtLevelId_fkey" FOREIGN KEY ("courtLevelId") REFERENCES "court_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
