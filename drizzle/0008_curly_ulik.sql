ALTER TABLE `ad_batches` ADD `selectedDates` json NOT NULL;--> statement-breakpoint
ALTER TABLE `advertisements` ADD `isLocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `premium_batches` ADD `selectedDates` json NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `portfolio` text;--> statement-breakpoint
ALTER TABLE `ad_batches` DROP COLUMN `startDate`;--> statement-breakpoint
ALTER TABLE `ad_batches` DROP COLUMN `endDate`;--> statement-breakpoint
ALTER TABLE `premium_batches` DROP COLUMN `startDate`;--> statement-breakpoint
ALTER TABLE `premium_batches` DROP COLUMN `endDate`;