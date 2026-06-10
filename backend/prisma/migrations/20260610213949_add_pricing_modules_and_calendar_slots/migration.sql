-- CreateEnum
CREATE TYPE "PricingModuleType" AS ENUM ('SINGLE', 'CONTINUOUS_BLOCK', 'WEEKLY_PACK');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "pricingModuleId" TEXT;

-- CreateTable
CREATE TABLE "PricingModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "moduleType" "PricingModuleType" NOT NULL DEFAULT 'CONTINUOUS_BLOCK',
    "durationHours" INTEGER,
    "weeklyHours" INTEGER,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingModule_slug_key" ON "PricingModule"("slug");

-- CreateIndex
CREATE INDEX "PricingModule_isActive_sortOrder_idx" ON "PricingModule"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Booking_pricingModuleId_idx" ON "Booking"("pricingModuleId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pricingModuleId_fkey" FOREIGN KEY ("pricingModuleId") REFERENCES "PricingModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
