/*
  Warnings:

  - You are about to drop the column `stockInfo` on the `customers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VisitStatus" AS ENUM ('start', 'end', 'wait', 'cancel');

-- AlterTable
ALTER TABLE "public"."customers" DROP COLUMN "stockInfo";

-- CreateTable
CREATE TABLE "public"."visits" (
    "id" SERIAL NOT NULL,
    "custId" INTEGER NOT NULL,
    "salesId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "cancelTime" TIMESTAMP(3),
    "status" "public"."VisitStatus" NOT NULL DEFAULT 'wait',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visits_custId_idx" ON "public"."visits"("custId");

-- CreateIndex
CREATE INDEX "visits_salesId_idx" ON "public"."visits"("salesId");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "public"."visits"("status");

-- CreateIndex
CREATE INDEX "visits_startTime_idx" ON "public"."visits"("startTime");

-- CreateIndex
CREATE INDEX "visits_createdAt_idx" ON "public"."visits"("createdAt");

-- CreateIndex
CREATE INDEX "visits_custId_salesId_idx" ON "public"."visits"("custId", "salesId");

-- CreateIndex
CREATE INDEX "visits_status_createdAt_idx" ON "public"."visits"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_custId_fkey" FOREIGN KEY ("custId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "public"."Salesman"("id") ON DELETE CASCADE ON UPDATE CASCADE;
