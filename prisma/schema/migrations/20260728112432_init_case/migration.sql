-- CreateTable
CREATE TABLE "court_levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "court_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_natures" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "case_natures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "party_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "natureId" INTEGER NOT NULL,
    "registrationDate" TIMESTAMP(3),
    "registrationFee" DECIMAL(65,30),
    "sectionCourtRoom" TEXT,
    "facts" TEXT,
    "relatedLaws" TEXT,
    "referredThrough" TEXT,
    "noticeStatus" TEXT,
    "fullJudgmentDate" TIMESTAMP(3),
    "judgmentVerifyDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_lawyers" (
    "caseId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "case_lawyers_pkey" PRIMARY KEY ("caseId","userId")
);

-- CreateTable
CREATE TABLE "case_parties" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "partyName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "fee" DECIMAL(65,30),
    "contactInfo" TEXT,

    CONSTRAINT "case_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_hearings" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "nextHearingDate" TIMESTAMP(3),
    "hearingDate" TIMESTAMP(3),
    "hearingOrder" TEXT,

    CONSTRAINT "case_hearings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_pleadings" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "pleaderUserId" TEXT,
    "pleadingDate" TIMESTAMP(3),
    "pleadingNotes" TEXT NOT NULL,

    CONSTRAINT "case_pleadings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_proceedings" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "courtLevelId" INTEGER NOT NULL,
    "courtName" TEXT NOT NULL,
    "chargeCounseling" TEXT,
    "verdict" TEXT,

    CONSTRAINT "court_proceedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_precedents" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "decisionNumber" TEXT,
    "plaintiff" TEXT,
    "defendant" TEXT,
    "citationNotes" TEXT,

    CONSTRAINT "case_precedents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "court_levels_name_key" ON "court_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "case_natures_name_key" ON "case_natures"("name");

-- CreateIndex
CREATE UNIQUE INDEX "party_roles_name_key" ON "party_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cases_caseNumber_key" ON "cases"("caseNumber");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "case_natures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_lawyers" ADD CONSTRAINT "case_lawyers_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_lawyers" ADD CONSTRAINT "case_lawyers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "party_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_hearings" ADD CONSTRAINT "case_hearings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_pleadings" ADD CONSTRAINT "case_pleadings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_pleadings" ADD CONSTRAINT "case_pleadings_pleaderUserId_fkey" FOREIGN KEY ("pleaderUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_proceedings" ADD CONSTRAINT "court_proceedings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_proceedings" ADD CONSTRAINT "court_proceedings_courtLevelId_fkey" FOREIGN KEY ("courtLevelId") REFERENCES "court_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_precedents" ADD CONSTRAINT "case_precedents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
