-- AlterTable
ALTER TABLE "page_types" ADD COLUMN     "parent_id" TEXT;

-- AddForeignKey
ALTER TABLE "page_types" ADD CONSTRAINT "page_types_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "page_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
