-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENTE');

-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE_DA_MANHA', 'LANCHE_DA_MANHA', 'ALMOCO', 'LANCHE_DA_TARDE', 'JANTA', 'CEIA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "pesoAtual" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "objetivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dieta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Dieta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refeicao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "horarioSugerido" TEXT,
    "dietaId" TEXT NOT NULL,

    CONSTRAINT "Refeicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" TEXT NOT NULL,
    "observacao" TEXT,
    "refeicaoId" TEXT NOT NULL,
    "receitaId" TEXT,

    CONSTRAINT "Alimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ingredientes" TEXT[],
    "modoPreparo" TEXT[],
    "tempoPreparo" TEXT,

    CONSTRAINT "Receita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckRefeicao" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "realizada" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT NOT NULL,
    "refeicaoId" TEXT NOT NULL,

    CONSTRAINT "CheckRefeicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroProgresso" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "peso" DOUBLE PRECISION,
    "aguaMl" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "RegistroProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CheckRefeicao_clienteId_refeicaoId_data_key" ON "CheckRefeicao"("clienteId", "refeicaoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroProgresso_clienteId_data_key" ON "RegistroProgresso"("clienteId", "data");

-- AddForeignKey
ALTER TABLE "Dieta" ADD CONSTRAINT "Dieta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refeicao" ADD CONSTRAINT "Refeicao_dietaId_fkey" FOREIGN KEY ("dietaId") REFERENCES "Dieta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimento" ADD CONSTRAINT "Alimento_refeicaoId_fkey" FOREIGN KEY ("refeicaoId") REFERENCES "Refeicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimento" ADD CONSTRAINT "Alimento_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckRefeicao" ADD CONSTRAINT "CheckRefeicao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckRefeicao" ADD CONSTRAINT "CheckRefeicao_refeicaoId_fkey" FOREIGN KEY ("refeicaoId") REFERENCES "Refeicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroProgresso" ADD CONSTRAINT "RegistroProgresso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
