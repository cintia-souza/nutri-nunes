-- CreateEnum
CREATE TYPE "TipoPergunta" AS ENUM ('TEXTO', 'CHECKBOX');

-- CreateTable
CREATE TABLE "Formulario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "perguntas" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaFormulario" (
    "id" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "respondidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formularioId" TEXT NOT NULL,

    CONSTRAINT "RespostaFormulario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Formulario_clienteId_idx" ON "Formulario"("clienteId");

-- AddForeignKey
ALTER TABLE "Formulario" ADD CONSTRAINT "Formulario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaFormulario" ADD CONSTRAINT "RespostaFormulario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "Formulario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
