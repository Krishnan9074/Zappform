/*
  Warnings:

  - You are about to drop the `AiPersona` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiPersona" DROP CONSTRAINT "AiPersona_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "AiPersona";

-- CreateTable
CREATE TABLE "ai_personas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PersonaStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_personas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_personas_userId_key" ON "ai_personas"("userId");

-- AddForeignKey
ALTER TABLE "ai_personas" ADD CONSTRAINT "ai_personas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
