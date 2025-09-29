/*
  Warnings:

  - The values [start,end,wait,cancel] on the enum `VisitStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `product_units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VisitStatus_new" AS ENUM ('START', 'END', 'WAIT', 'CANCEL');
ALTER TABLE "public"."visits" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."visits" ALTER COLUMN "status" TYPE "public"."VisitStatus_new" USING ("status"::text::"public"."VisitStatus_new");
ALTER TYPE "public"."VisitStatus" RENAME TO "VisitStatus_old";
ALTER TYPE "public"."VisitStatus_new" RENAME TO "VisitStatus";
DROP TYPE "public"."VisitStatus_old";
ALTER TABLE "public"."visits" ALTER COLUMN "status" SET DEFAULT 'WAIT';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."product_units" DROP CONSTRAINT "product_units_productId_fkey";

-- AlterTable
ALTER TABLE "public"."visits" ALTER COLUMN "status" SET DEFAULT 'WAIT';

-- DropTable
DROP TABLE "public"."product_units";

-- DropTable
DROP TABLE "public"."products";

-- CreateTable
CREATE TABLE "public"."Product" (
    "productId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "nonSellableQty" INTEGER NOT NULL,
    "baseUom" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."prod_uom" (
    "productId" INTEGER NOT NULL,
    "uom" TEXT NOT NULL,
    "uomName" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "num" INTEGER NOT NULL,
    "denum" INTEGER NOT NULL,

    CONSTRAINT "prod_uom_pkey" PRIMARY KEY ("productId","uom")
);

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "public"."Product"("category");

-- AddForeignKey
ALTER TABLE "public"."prod_uom" ADD CONSTRAINT "prod_uom_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
