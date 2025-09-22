-- CreateEnum
CREATE TYPE "public"."UnitType" AS ENUM ('PIECE', 'BOX', 'CARTON');

-- CreateEnum
CREATE TYPE "public"."SalesmanStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."LoginState" AS ENUM ('INITIAL', 'ACTIVE');

-- CreateEnum
CREATE TYPE "public"."AuthorityType" AS ENUM ('WEB', 'MOBILE');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "stockInfo" JSONB,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "barcode" TEXT NOT NULL,
    "category" TEXT,
    "brand" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_units" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "unitType" "public"."UnitType" NOT NULL,
    "unitSize" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Salesman" (
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "public"."SalesmanStatus" NOT NULL DEFAULT 'INACTIVE',
    "password" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "loginState" "public"."LoginState" NOT NULL DEFAULT 'INITIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "Salesman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."authorities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AuthorityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salesman_authorities" (
    "id" SERIAL NOT NULL,
    "salesmanId" INTEGER NOT NULL,
    "authorityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salesman_authorities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "public"."customers"("name");

-- CreateIndex
CREATE INDEX "customers_industry_idx" ON "public"."customers"("industry");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "public"."customers"("createdAt");

-- CreateIndex
CREATE INDEX "customers_latitude_longitude_idx" ON "public"."customers"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "customers_name_industry_idx" ON "public"."customers"("name", "industry");

-- CreateIndex
CREATE INDEX "customers_createdAt_id_idx" ON "public"."customers"("createdAt", "id");

-- CreateIndex
CREATE INDEX "customers_name_createdAt_idx" ON "public"."customers"("name", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "public"."products"("barcode");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "public"."products"("name");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "public"."products"("category");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "public"."products"("brand");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "public"."products"("isActive");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "public"."products"("createdAt");

-- CreateIndex
CREATE INDEX "products_name_category_idx" ON "public"."products"("name", "category");

-- CreateIndex
CREATE INDEX "products_isActive_createdAt_idx" ON "public"."products"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "product_units_productId_idx" ON "public"."product_units"("productId");

-- CreateIndex
CREATE INDEX "product_units_unitType_idx" ON "public"."product_units"("unitType");

-- CreateIndex
CREATE INDEX "product_units_isActive_idx" ON "public"."product_units"("isActive");

-- CreateIndex
CREATE INDEX "product_units_price_idx" ON "public"."product_units"("price");

-- CreateIndex
CREATE INDEX "product_units_productId_isActive_idx" ON "public"."product_units"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_units_price_unitType_idx" ON "public"."product_units"("price", "unitType");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_productId_unitType_key" ON "public"."product_units"("productId", "unitType");

-- CreateIndex
CREATE UNIQUE INDEX "Salesman_phone_key" ON "public"."Salesman"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "authorities_name_key" ON "public"."authorities"("name");

-- CreateIndex
CREATE INDEX "authorities_name_idx" ON "public"."authorities"("name");

-- CreateIndex
CREATE INDEX "authorities_type_idx" ON "public"."authorities"("type");

-- CreateIndex
CREATE INDEX "authorities_createdAt_idx" ON "public"."authorities"("createdAt");

-- CreateIndex
CREATE INDEX "salesman_authorities_salesmanId_idx" ON "public"."salesman_authorities"("salesmanId");

-- CreateIndex
CREATE INDEX "salesman_authorities_authorityId_idx" ON "public"."salesman_authorities"("authorityId");

-- CreateIndex
CREATE INDEX "salesman_authorities_createdAt_idx" ON "public"."salesman_authorities"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "salesman_authorities_salesmanId_authorityId_key" ON "public"."salesman_authorities"("salesmanId", "authorityId");

-- AddForeignKey
ALTER TABLE "public"."product_units" ADD CONSTRAINT "product_units_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salesman_authorities" ADD CONSTRAINT "salesman_authorities_salesmanId_fkey" FOREIGN KEY ("salesmanId") REFERENCES "public"."Salesman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salesman_authorities" ADD CONSTRAINT "salesman_authorities_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "public"."authorities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
