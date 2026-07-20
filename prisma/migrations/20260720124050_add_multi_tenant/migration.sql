/*
  Migration: add_multi_tenant
  Estratégia para banco com dados existentes (P3018 / 23502):

  Fase 1 — Estrutura sem constraints NOT NULL
  Fase 2 — Cria o Tenant inicial a partir do admin existente
  Fase 3 — Backfill: preenche tenantId em todas as tabelas
  Fase 4 — Aplica NOT NULL + índices + foreign keys
*/

-- ─────────────────────────────────────────────────────────────
-- FASE 1: Adiciona enum SUPERADMIN e cria tabela Tenant
-- ─────────────────────────────────────────────────────────────

ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

CREATE TABLE "Tenant" (
    "id"        TEXT        NOT NULL,
    "nome"      TEXT        NOT NULL,
    "email"     TEXT        NOT NULL,
    "crn"       TEXT,
    "slug"      TEXT        NOT NULL,
    "logoUrl"   TEXT,
    "ativo"     BOOLEAN     NOT NULL DEFAULT true,
    "criadoEm"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");
CREATE UNIQUE INDEX "Tenant_slug_key"  ON "Tenant"("slug");
CREATE INDEX        "Tenant_slug_idx"  ON "Tenant"("slug");

-- ─────────────────────────────────────────────────────────────
-- FASE 2: Adiciona colunas tenantId como NULLABLE em todas as tabelas
-- (sem NOT NULL — permite o backfill a seguir)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Usuario"     ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Dieta"       ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Receita"     ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Post"        ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Formulario"  ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Agendamento" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Servico"     ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Plano"       ADD COLUMN "tenantId" TEXT;

-- ConfigSite: troca PK de "id" fixo para tenantId
ALTER TABLE "ConfigSite" DROP CONSTRAINT "ConfigSite_pkey";
ALTER TABLE "ConfigSite" DROP COLUMN "id";
ALTER TABLE "ConfigSite" ADD COLUMN "tenantId" TEXT;

-- ─────────────────────────────────────────────────────────────
-- FASE 3: Cria o Tenant inicial derivado do admin existente
-- e faz o backfill de todas as tabelas
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_tenant_id TEXT;
  v_admin_nome TEXT;
  v_admin_email TEXT;
BEGIN
  -- Lê o admin existente
  SELECT id, nome, email
    INTO v_tenant_id, v_admin_nome, v_admin_email
    FROM "Usuario"
   WHERE role = 'ADMIN'
   ORDER BY "criadoEm"
   LIMIT 1;

  -- Se não existe admin, cria um tenant placeholder
  IF v_tenant_id IS NULL THEN
    v_tenant_id  := gen_random_uuid()::TEXT;
    v_admin_nome  := 'Nutricionista';
    v_admin_email := 'admin@nutrinunes.com';
  END IF;

  -- Insere o Tenant usando o mesmo ID do admin como ID do tenant
  -- (conveniente: admin.id = tenant.id no tenant inicial)
  INSERT INTO "Tenant" ("id", "nome", "email", "slug", "ativo")
  VALUES (
    v_tenant_id,
    v_admin_nome,
    v_admin_email,
    -- slug: lowercase, sem acentos, sem espaços
    lower(regexp_replace(
      translate(v_admin_nome,
        'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ',
        'aaaaaaeeeeiiiiooooouuuucAAAAAAAAEEEEIIIIOOOOOUUUUC'
      ),
      '[^a-z0-9]+', '-', 'g'
    )),
    true
  )
  ON CONFLICT ("id") DO NOTHING;

  -- Backfill: todas as tabelas recebem o tenantId do tenant inicial
  UPDATE "Usuario"     SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Dieta"       SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Receita"     SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Post"        SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Formulario"  SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Agendamento" SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Servico"     SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "Plano"       SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
  UPDATE "ConfigSite"  SET "tenantId" = v_tenant_id WHERE "tenantId" IS NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- FASE 4: Aplica NOT NULL agora que todas as linhas têm valor
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Usuario"     ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Dieta"       ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Receita"     ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Post"        ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Formulario"  ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Agendamento" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Servico"     ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Plano"       ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ConfigSite"  ALTER COLUMN "tenantId" SET NOT NULL;

-- ConfigSite: nova PK
ALTER TABLE "ConfigSite" ADD CONSTRAINT "ConfigSite_pkey" PRIMARY KEY ("tenantId");

-- ─────────────────────────────────────────────────────────────
-- FASE 5: Índices e unique constraints
-- ─────────────────────────────────────────────────────────────

-- Post: slug deixa de ser globalmente único, passa a ser único por tenant
DROP INDEX IF EXISTS "Post_slug_key";
CREATE UNIQUE INDEX "Post_tenantId_slug_key"     ON "Post"("tenantId", "slug");
CREATE INDEX        "Post_tenantId_publicado_idx" ON "Post"("tenantId", "publicado");

-- Usuario: email deixa de ser globalmente único, passa a ser único por tenant
DROP INDEX IF EXISTS "Usuario_email_key";
CREATE UNIQUE INDEX "Usuario_tenantId_email_key" ON "Usuario"("tenantId", "email");
CREATE INDEX        "Usuario_tenantId_role_idx"  ON "Usuario"("tenantId", "role");

-- Formulario: recria índice
DROP INDEX IF EXISTS "Formulario_clienteId_idx";
CREATE INDEX "Formulario_tenantId_clienteId_idx" ON "Formulario"("tenantId", "clienteId");

-- Demais índices
CREATE INDEX "Agendamento_tenantId_data_idx" ON "Agendamento"("tenantId", "data");
CREATE INDEX "Dieta_tenantId_clienteId_idx"  ON "Dieta"("tenantId", "clienteId");
CREATE INDEX "Plano_tenantId_idx"            ON "Plano"("tenantId");
CREATE INDEX "Receita_tenantId_idx"          ON "Receita"("tenantId");
CREATE INDEX "Servico_tenantId_idx"          ON "Servico"("tenantId");

-- ─────────────────────────────────────────────────────────────
-- FASE 6: Foreign keys
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "Usuario"     ADD CONSTRAINT "Usuario_tenantId_fkey"     FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dieta"       ADD CONSTRAINT "Dieta_tenantId_fkey"       FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Receita"     ADD CONSTRAINT "Receita_tenantId_fkey"     FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post"        ADD CONSTRAINT "Post_tenantId_fkey"        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Formulario"  ADD CONSTRAINT "Formulario_tenantId_fkey"  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConfigSite"  ADD CONSTRAINT "ConfigSite_tenantId_fkey"  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Servico"     ADD CONSTRAINT "Servico_tenantId_fkey"     FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Plano"       ADD CONSTRAINT "Plano_tenantId_fkey"       FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
