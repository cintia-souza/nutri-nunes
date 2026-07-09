-- CreateEnum
CREATE TYPE "TipoEntradaDiario" AS ENUM ('NOTA', 'MEDIDA', 'AVALIACAO_NUTRICIONAL', 'CONSULTA');

-- CreateTable
CREATE TABLE "EntradaDiario" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tipo" "TipoEntradaDiario" NOT NULL,
    "titulo" TEXT,
    "texto" TEXT,
    "peso" DOUBLE PRECISION,
    "pressaoSist" INTEGER,
    "pressaoDiast" INTEGER,
    "glicemia" DOUBLE PRECISION,
    "temperatura" DOUBLE PRECISION,
    "circAbdominal" DOUBLE PRECISION,
    "circBraco" DOUBLE PRECISION,
    "circQuadril" DOUBLE PRECISION,
    "avaliacaoNutricionalId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "EntradaDiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntradaDiario_clienteId_data_idx" ON "EntradaDiario"("clienteId", "data");

-- AddForeignKey
ALTER TABLE "EntradaDiario" ADD CONSTRAINT "EntradaDiario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
