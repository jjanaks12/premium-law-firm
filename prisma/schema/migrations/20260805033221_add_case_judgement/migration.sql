-- CreateTable
CREATE TABLE "case_judgements" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "caseCourtDetailId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "verifiedDate" TIMESTAMP(3),
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_judgements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "case_judgements" ADD CONSTRAINT "case_judgements_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_judgements" ADD CONSTRAINT "case_judgements_caseCourtDetailId_fkey" FOREIGN KEY ("caseCourtDetailId") REFERENCES "case_court_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
