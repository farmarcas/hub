-- CreateEnum
CREATE TYPE "group_type" AS ENUM ('theme', 'directorate');

-- CreateEnum
CREATE TYPE "solution_status" AS ENUM ('in_review', 'published');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "type" "group_type" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solutions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "status" "solution_status" NOT NULL DEFAULT 'in_review',
    "access_all" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_groups" (
    "solution_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,

    CONSTRAINT "solution_groups_pkey" PRIMARY KEY ("solution_id","group_id")
);

-- CreateTable
CREATE TABLE "solution_related" (
    "solution_a_id" UUID NOT NULL,
    "solution_b_id" UUID NOT NULL,

    CONSTRAINT "solution_related_pkey" PRIMARY KEY ("solution_a_id","solution_b_id")
);

-- CreateTable
CREATE TABLE "solution_access_groups" (
    "solution_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,

    CONSTRAINT "solution_access_groups_pkey" PRIMARY KEY ("solution_id","group_id")
);

-- CreateTable
CREATE TABLE "solution_access_users" (
    "solution_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "solution_access_users_pkey" PRIMARY KEY ("solution_id","user_id")
);

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE INDEX "solutions_category_id_idx" ON "solutions"("category_id");

-- CreateIndex
CREATE INDEX "solution_groups_group_id_idx" ON "solution_groups"("group_id");

-- CreateIndex
CREATE INDEX "solution_related_solution_b_id_idx" ON "solution_related"("solution_b_id");

-- CreateIndex
CREATE INDEX "solution_access_groups_group_id_idx" ON "solution_access_groups"("group_id");

-- CreateIndex
CREATE INDEX "solution_access_users_user_id_idx" ON "solution_access_users"("user_id");

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_groups" ADD CONSTRAINT "solution_groups_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_groups" ADD CONSTRAINT "solution_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_related" ADD CONSTRAINT "solution_related_solution_a_id_fkey" FOREIGN KEY ("solution_a_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_related" ADD CONSTRAINT "solution_related_solution_b_id_fkey" FOREIGN KEY ("solution_b_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_access_groups" ADD CONSTRAINT "solution_access_groups_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_access_groups" ADD CONSTRAINT "solution_access_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_access_users" ADD CONSTRAINT "solution_access_users_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_access_users" ADD CONSTRAINT "solution_access_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Escrito à mão (o Prisma não declara collation, índice parcial nem CHECK).
-- ---------------------------------------------------------------------------

-- Ordenação em português para textos mostrados às pessoas (database/DATABASE.md).
CREATE COLLATION IF NOT EXISTS pt_br (provider = icu, locale = 'pt-BR', deterministic = true);
ALTER TABLE "users" ALTER COLUMN "name" TYPE TEXT COLLATE pt_br;
ALTER TABLE "groups" ALTER COLUMN "name" TYPE TEXT COLLATE pt_br;
ALTER TABLE "categories" ALTER COLUMN "name" TYPE TEXT COLLATE pt_br;
ALTER TABLE "solutions" ALTER COLUMN "name" TYPE TEXT COLLATE pt_br;

-- Nome de grupo único entre os ativos, ignorando maiúsculas e espaços nas pontas.
CREATE UNIQUE INDEX "groups_name_active_uidx" ON "groups" (lower(btrim("name"))) WHERE "deleted_at" IS NULL;
ALTER TABLE "groups" ADD CONSTRAINT "groups_name_not_blank_chk" CHECK (btrim("name") <> '');

-- Categoria é lista aberta, sem duplicar "Micro SaaS" e " micro saas ".
CREATE UNIQUE INDEX "categories_name_uidx" ON "categories" (lower(btrim("name")));
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_not_blank_chk" CHECK (btrim("name") <> '');

-- Soluções: endereço sempre https; nome e descrição curta com limite de negócio.
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_url_https_chk" CHECK ("url" ~ '^https://');
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_name_len_chk" CHECK (char_length("name") BETWEEN 1 AND 120);
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_description_len_chk" CHECK (char_length("description") BETWEEN 1 AND 160);

-- O que entra no globo: publicadas e não arquivadas.
CREATE INDEX "solutions_visible_idx" ON "solutions" ("status") WHERE "archived_at" IS NULL;

-- Relação simétrica guardada uma vez por par (a < b).
ALTER TABLE "solution_related" ADD CONSTRAINT "solution_related_order_chk" CHECK ("solution_a_id" < "solution_b_id");
