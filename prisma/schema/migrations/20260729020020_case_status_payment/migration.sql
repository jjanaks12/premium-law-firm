-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Draft';
