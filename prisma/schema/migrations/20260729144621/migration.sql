-- CreateTable
CREATE TABLE "case_documents" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "description" TEXT,
    "documentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
