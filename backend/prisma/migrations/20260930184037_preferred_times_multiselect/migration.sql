/*
  Warnings:

  - You are about to drop the column `preferredTime` on the `skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `skill` DROP COLUMN `preferredTime`,
    ADD COLUMN `preferredTimes` JSON NULL;
