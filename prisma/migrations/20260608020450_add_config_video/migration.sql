-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "ConfigSite" (
    "id" TEXT NOT NULL DEFAULT 'config',
    "fotoSobre" TEXT,
    "fotoCapa" TEXT,
    "bio1" TEXT,
    "bio2" TEXT,
    "crn" TEXT,
    "especialidades" TEXT[],
    "telefone" TEXT,
    "endereco" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,

    CONSTRAINT "ConfigSite_pkey" PRIMARY KEY ("id")
);
