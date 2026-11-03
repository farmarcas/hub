-- AlterTable
ALTER TABLE "solutions" ADD COLUMN     "deleted_at" TIMESTAMPTZ(3);

-- Escrito à mão: o que entra no globo agora também exclui as soluções excluídas.
DROP INDEX "solutions_visible_idx";
CREATE INDEX "solutions_visible_idx" ON "solutions" ("status") WHERE "archived_at" IS NULL AND "deleted_at" IS NULL;
