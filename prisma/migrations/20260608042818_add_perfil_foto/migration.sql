-- CreateTable
CREATE TABLE "PerfilFoto" (
    "id" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PerfilFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerfilFoto_userId_key" ON "PerfilFoto"("userId");
