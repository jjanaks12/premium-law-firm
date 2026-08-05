-- AlterTable
ALTER TABLE "case_payments" ADD COLUMN     "receivedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "case_payments" ADD CONSTRAINT "case_payments_receivedByUserId_fkey" FOREIGN KEY ("receivedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
