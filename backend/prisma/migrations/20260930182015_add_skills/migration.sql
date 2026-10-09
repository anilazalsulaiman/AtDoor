-- CreateTable
CREATE TABLE `Skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workerId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,
    `suggestedCategoryName` VARCHAR(191) NULL,
    `skillTitle` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `residenceLocation` VARCHAR(191) NOT NULL,
    `workingDaysType` ENUM('DAILY', 'SPECIFIC_DAYS', 'SPECIFIC_DATES') NULL,
    `preferredDays` JSON NULL,
    `preferredDates` JSON NULL,
    `preferredTime` ENUM('ANYTIME', 'MORNING', 'EVENING', 'NIGHT') NULL,
    `preferredLocations` JSON NULL,
    `workingTypes` JSON NULL,
    `experienceLevel` ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT', 'CUSTOM') NULL,
    `experienceYears` INTEGER NULL,
    `experienceMonths` INTEGER NULL,
    `pricingType` ENUM('FIXED', 'RANGE') NULL,
    `priceFixed` DOUBLE NULL,
    `priceMin` DOUBLE NULL,
    `priceMax` DOUBLE NULL,
    `languages` JSON NULL,
    `education` VARCHAR(191) NULL,
    `projectPreference` ENUM('ONSITE', 'REMOTE', 'ANY') NULL,
    `preferredCommunication` ENUM('CHAT', 'EMAIL', 'PHONE', 'ANY') NULL,
    `aboutDescription` TEXT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkillPortfolioLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skillId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkillCertification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skillId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `issuer` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkillPortfolioLink` ADD CONSTRAINT `SkillPortfolioLink_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkillCertification` ADD CONSTRAINT `SkillCertification_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
