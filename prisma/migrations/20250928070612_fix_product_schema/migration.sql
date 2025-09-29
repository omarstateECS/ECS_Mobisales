/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `prod_uom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `prod_uom` table. All the data in the column will be lost.
  - You are about to alter the column `uom` on the `prod_uom` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - A unique constraint covering the columns `[barcode]` on the table `prod_uom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prodId` to the `prod_uom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."prod_uom" DROP CONSTRAINT "prod_uom_productId_fkey";

-- DropIndex
DROP INDEX "public"."Product_name_idx";

-- AlterTable
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "productId",
DROP COLUMN "updatedAt",
ADD COLUMN     "prodId" SERIAL NOT NULL,
ALTER COLUMN "stock" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "nonSellableQty" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "baseUom" SET DATA TYPE TEXT,
ALTER COLUMN "basePrice" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("prodId");

-- AlterTable
ALTER TABLE "public"."prod_uom" DROP CONSTRAINT "prod_uom_pkey",
DROP COLUMN "productId",
ADD COLUMN     "prodId" INTEGER NOT NULL,
ALTER COLUMN "uom" SET DATA TYPE VARCHAR(3),
ADD CONSTRAINT "prod_uom_pkey" PRIMARY KEY ("prodId", "uom");

-- CreateIndex
CREATE INDEX "Product_baseUom_idx" ON "public"."Product"("baseUom");

-- CreateIndex
CREATE UNIQUE INDEX "prod_uom_barcode_key" ON "public"."prod_uom"("barcode");

-- AddForeignKey
ALTER TABLE "public"."prod_uom" ADD CONSTRAINT "prod_uom_prodId_fkey" FOREIGN KEY ("prodId") REFERENCES "public"."Product"("prodId") ON DELETE CASCADE ON UPDATE CASCADE;
