/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,slug]` on the table `PricingModule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PricingModule_slug_key";

-- AlterTable
ALTER TABLE "PricingModule" ADD COLUMN     "spaceId" TEXT;

-- CreateIndex
CREATE INDEX "PricingModule_spaceId_idx" ON "PricingModule"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingModule_spaceId_slug_key" ON "PricingModule"("spaceId", "slug");

-- AddForeignKey
ALTER TABLE "PricingModule" ADD CONSTRAINT "PricingModule_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
