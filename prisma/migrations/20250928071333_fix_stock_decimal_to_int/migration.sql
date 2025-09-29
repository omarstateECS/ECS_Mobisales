/*
  Warnings:

  - You are about to alter the column `stock` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `nonSellableQty` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "stock" SET DATA TYPE INTEGER,
ALTER COLUMN "nonSellableQty" SET DATA TYPE INTEGER;
