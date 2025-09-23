/*
  Warnings:

  - You are about to drop the column `loginState` on the `Salesman` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Salesman" DROP COLUMN "loginState",
ADD COLUMN     "isInitial" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "public"."LoginState";
