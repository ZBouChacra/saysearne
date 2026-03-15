CREATE TABLE `site_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(100) NOT NULL,
	`configValue` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_config_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `dateOfBirth` varchar(10);--> statement-breakpoint
ALTER TABLE `appointments` ADD `serviceId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `endDate` timestamp;--> statement-breakpoint
ALTER TABLE `availability` ADD `professionId` int;--> statement-breakpoint
ALTER TABLE `categories` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `status` enum('pending','in_progress','closed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `adminReply` text;--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `repliedAt` timestamp;--> statement-breakpoint
ALTER TABLE `services` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profileType` enum('customer','professional') DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `professionalFee` decimal(10,2);--> statement-breakpoint
ALTER TABLE `users` ADD `feeEnabled` boolean DEFAULT false NOT NULL;