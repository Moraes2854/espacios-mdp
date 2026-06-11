/*
  Warnings:

  - A unique constraint covering the columns `[spaceId,amenityId]` on the table `SpaceAmenity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SpaceAmenity" ADD COLUMN     "amenityId" TEXT,
ADD COLUMN     "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_slug_key" ON "Amenity"("slug");

-- CreateIndex
CREATE INDEX "Amenity_isActive_sortOrder_idx" ON "Amenity"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "SpaceAmenity_amenityId_idx" ON "SpaceAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceAmenity_spaceId_amenityId_key" ON "SpaceAmenity"("spaceId", "amenityId");

-- AddForeignKey
ALTER TABLE "SpaceAmenity" ADD CONSTRAINT "SpaceAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
