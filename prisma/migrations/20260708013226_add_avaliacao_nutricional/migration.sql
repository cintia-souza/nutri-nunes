-- CreateTable
CREATE TABLE "AvaliacaoNutricional" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "frutas" INTEGER NOT NULL DEFAULT 0,
    "verduras" INTEGER NOT NULL DEFAULT 0,
    "legumes" INTEGER NOT NULL DEFAULT 0,
    "proteinas" INTEGER NOT NULL DEFAULT 0,
    "cereais" INTEGER NOT NULL DEFAULT 0,
    "agua" INTEGER NOT NULL DEFAULT 0,
    "refrigerantes" INTEGER NOT NULL DEFAULT 0,
    "doces" INTEGER NOT NULL DEFAULT 0,
    "fastFood" INTEGER NOT NULL DEFAULT 0,
    "ultraprocessados" INTEGER NOT NULL DEFAULT 0,
    "beliscos" INTEGER NOT NULL DEFAULT 0,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "AvaliacaoNutricional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvaliacaoNutricional_clienteId_data_idx" ON "AvaliacaoNutricional"("clienteId", "data");

-- AddForeignKey
ALTER TABLE "AvaliacaoNutricional" ADD CONSTRAINT "AvaliacaoNutricional_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
