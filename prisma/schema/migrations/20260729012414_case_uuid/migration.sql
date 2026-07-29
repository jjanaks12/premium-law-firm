/*
  Warnings:

  - The primary key for the `case_hearings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_lawyers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_natures` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_parties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_pleadings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_precedents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `cases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `court_levels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `court_proceedings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `party_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "case_hearings" DROP CONSTRAINT "case_hearings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_lawyers" DROP CONSTRAINT "case_lawyers_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_parties" DROP CONSTRAINT "case_parties_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_parties" DROP CONSTRAINT "case_parties_roleId_fkey";

-- DropForeignKey
ALTER TABLE "case_pleadings" DROP CONSTRAINT "case_pleadings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_precedents" DROP CONSTRAINT "case_precedents_caseId_fkey";

-- DropForeignKey
ALTER TABLE "cases" DROP CONSTRAINT "cases_natureId_fkey";

-- DropForeignKey
ALTER TABLE "court_proceedings" DROP CONSTRAINT "court_proceedings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "court_proceedings" DROP CONSTRAINT "court_proceedings_courtLevelId_fkey";

-- AlterTable
ALTER TABLE "case_hearings" DROP CONSTRAINT "case_hearings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_hearings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_hearings_id_seq";

-- AlterTable
ALTER TABLE "case_lawyers" DROP CONSTRAINT "case_lawyers_pkey",
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_lawyers_pkey" PRIMARY KEY ("caseId", "userId");

-- AlterTable
ALTER TABLE "case_natures" DROP CONSTRAINT "case_natures_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_natures_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_natures_id_seq";

-- AlterTable
ALTER TABLE "case_parties" DROP CONSTRAINT "case_parties_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_parties_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_parties_id_seq";

-- AlterTable
ALTER TABLE "case_pleadings" DROP CONSTRAINT "case_pleadings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_pleadings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_pleadings_id_seq";

-- AlterTable
ALTER TABLE "case_precedents" DROP CONSTRAINT "case_precedents_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_precedents_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_precedents_id_seq";

-- AlterTable
ALTER TABLE "cases" DROP CONSTRAINT "cases_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "natureId" SET DATA TYPE TEXT,
ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "cases_id_seq";

-- AlterTable
ALTER TABLE "court_levels" DROP CONSTRAINT "court_levels_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "court_levels_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "court_levels_id_seq";

-- AlterTable
ALTER TABLE "court_proceedings" DROP CONSTRAINT "court_proceedings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "courtLevelId" SET DATA TYPE TEXT,
ADD CONSTRAINT "court_proceedings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "court_proceedings_id_seq";

-- AlterTable
ALTER TABLE "party_roles" DROP CONSTRAINT "party_roles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "party_roles_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "party_roles_id_seq";

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "case_natures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_lawyers" ADD CONSTRAINT "case_lawyers_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "party_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_hearings" ADD CONSTRAINT "case_hearings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_pleadings" ADD CONSTRAINT "case_pleadings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_proceedings" ADD CONSTRAINT "court_proceedings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_proceedings" ADD CONSTRAINT "court_proceedings_courtLevelId_fkey" FOREIGN KEY ("courtLevelId") REFERENCES "court_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_precedents" ADD CONSTRAINT "case_precedents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
