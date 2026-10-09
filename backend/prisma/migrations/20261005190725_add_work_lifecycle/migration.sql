-- AlterTable
ALTER TABLE `job` ADD COLUMN `endAcceptedByCreator` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `endAcceptedByWorker` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `startAcceptedByCreator` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `startAcceptedByWorker` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workEndedAt` DATETIME(3) NULL,
    ADD COLUMN `workStartedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `JobWorkLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` INTEGER NOT NULL,
    `type` ENUM('START', 'RESCHEDULE', 'EXTENSION', 'MARK_DONE') NOT NULL,
    `proposedBy` INTEGER NOT NULL,
    `acceptedBy` INTEGER NULL,
    `oldStartTime` DATETIME(3) NULL,
    `oldEndTime` DATETIME(3) NULL,
    `newStartTime` DATETIME(3) NULL,
    `newEndTime` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobWorkLog` ADD CONSTRAINT `JobWorkLog_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
