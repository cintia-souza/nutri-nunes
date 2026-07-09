-- CreateTable
CREATE TABLE "RegistroHabito" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "aderenciaDieta" INTEGER NOT NULL DEFAULT 0,
    "variedadeAlimentar" INTEGER NOT NULL DEFAULT 0,
    "aceitacaoNovos" INTEGER NOT NULL DEFAULT 0,
    "hidratacao" INTEGER NOT NULL DEFAULT 0,
    "comportamentoMesa" INTEGER NOT NULL DEFAULT 0,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "RegistroHabito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroHabito_clienteId_data_key" ON "RegistroHabito"("clienteId", "data");

-- AddForeignKey
ALTER TABLE "RegistroHabito" ADD CONSTRAINT "RegistroHabito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
