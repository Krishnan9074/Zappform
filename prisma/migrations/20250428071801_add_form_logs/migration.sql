/*
  Warnings:

  - You are about to drop the column `domainName` on the `FormSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `FormSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `FormSubmission` table. All the data in the column will be lost.
  - Added the required column `domain` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FormSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormSubmission" DROP CONSTRAINT "FormSubmission_templateId_fkey";

-- AlterTable
ALTER TABLE "FormSubmission" DROP COLUMN "domainName",
DROP COLUMN "success",
DROP COLUMN "templateId",
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "formTemplateId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "createdById" TEXT;

-- CreateTable
CREATE TABLE "FormFillLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "fieldsCount" INTEGER NOT NULL,
    "suggestionsCount" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormFillLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormFillLog" ADD CONSTRAINT "FormFillLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
