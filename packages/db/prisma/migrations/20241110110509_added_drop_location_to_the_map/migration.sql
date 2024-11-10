/*
  Warnings:

  - Added the required column `dropX` to the `Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropY` to the `Map` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "dropX" INTEGER NOT NULL,
ADD COLUMN     "dropY" INTEGER NOT NULL;
