-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "invitation_token" TEXT,
    "invitation_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "detail" JSONB DEFAULT '{}',
    "avatar_id" TEXT,
    "role_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "court_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_natures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "case_natures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT,

    CONSTRAINT "party_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "registrationFee" DECIMAL(65,30),
    "facts" TEXT,
    "relatedLaws" TEXT,
    "referredThrough" TEXT,
    "noticeStatus" TEXT,
    "fullJudgmentDate" TIMESTAMP(3),
    "judgmentVerifyDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_court_details" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3),
    "judgeName" TEXT,
    "sectionCourtRoom" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_court_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_lawyers" (
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "case_lawyers_pkey" PRIMARY KEY ("caseId","userId")
);

-- CreateTable
CREATE TABLE "case_parties" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "fee" DECIMAL(65,30),
    "citizenshipNo" TEXT,
    "permanentAddress" TEXT,
    "temporaryAddress" TEXT,
    "contactNo" TEXT,
    "parentId" TEXT,

    CONSTRAINT "case_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_hearings" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "nextHearingDate" TIMESTAMP(3),
    "hearingDate" TIMESTAMP(3),
    "hearingOrder" TEXT,
    "judgeName" TEXT,

    CONSTRAINT "case_hearings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_pleadings" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "pleaderUserId" TEXT,
    "pleadingDate" TIMESTAMP(3),
    "pleadingNotes" TEXT NOT NULL,

    CONSTRAINT "case_pleadings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_proceedings" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "courtLevelId" TEXT NOT NULL,
    "courtName" TEXT NOT NULL,
    "judgeName" TEXT,
    "chargeCounseling" TEXT,
    "verdict" TEXT,

    CONSTRAINT "court_proceedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_precedents" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "decisionNumber" TEXT,
    "plaintiff" TEXT,
    "defendant" TEXT,
    "citationNotes" TEXT,

    CONSTRAINT "case_precedents_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "page_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "parent_id" TEXT,
    "page_type_id" TEXT,
    "thumbnail_id" TEXT,
    "author_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image_id" TEXT,
    "canonical_url" TEXT,
    "robots" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_schemas" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "schema_type" TEXT,
    "schema_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_invitation_token_key" ON "users"("invitation_token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "court_levels_name_key" ON "court_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "case_natures_name_key" ON "case_natures"("name");

-- CreateIndex
CREATE UNIQUE INDEX "party_roles_name_key" ON "party_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "case_court_details_caseNumber_key" ON "case_court_details"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "page_types_name_key" ON "page_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "page_types_slug_key" ON "page_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_page_id_key" ON "page_seo"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_schemas_page_id_key" ON "page_schemas"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "case_natures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_court_details" ADD CONSTRAINT "case_court_details_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_court_details" ADD CONSTRAINT "case_court_details_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "case_court_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_lawyers" ADD CONSTRAINT "case_lawyers_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_lawyers" ADD CONSTRAINT "case_lawyers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "party_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "case_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "case_payments" ADD CONSTRAINT "case_payments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_counselings" ADD CONSTRAINT "case_counselings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_counselings" ADD CONSTRAINT "case_counselings_counselorUserId_fkey" FOREIGN KEY ("counselorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_page_type_id_fkey" FOREIGN KEY ("page_type_id") REFERENCES "page_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_og_image_id_fkey" FOREIGN KEY ("og_image_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_schemas" ADD CONSTRAINT "page_schemas_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
