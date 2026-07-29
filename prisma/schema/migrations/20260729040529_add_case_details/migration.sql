-- AlterTable
ALTER TABLE "case_hearings" ADD COLUMN     "judgeName" TEXT;

-- AlterTable
ALTER TABLE "court_proceedings" ADD COLUMN     "judgeName" TEXT;

-- CreateTable
CREATE TABLE "case_payments" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "method" TEXT,
    "referenceNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_counselings" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "counselorUserId" TEXT,
    "date" TIMESTAMP(3),
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_counselings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "case_payments" ADD CONSTRAINT "case_payments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_counselings" ADD CONSTRAINT "case_counselings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_counselings" ADD CONSTRAINT "case_counselings_counselorUserId_fkey" FOREIGN KEY ("counselorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
