CREATE TABLE `ad_batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advertisementId` int NOT NULL,
	`country` varchar(100),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`feePerDay` decimal(10,2) NOT NULL,
	`totalDays` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','paid','active','cancelled','expired') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feeType` enum('premium','advertisement') NOT NULL,
	`country` varchar(100),
	`feePerDay` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fee_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_order_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configType` enum('premium','advertisement') NOT NULL,
	`country` varchar(100),
	`maxCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_order_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premium_batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`country` varchar(100),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`feePerDay` decimal(10,2) NOT NULL,
	`totalDays` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','paid','active','cancelled','expired') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premium_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `advertisements` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `advertisements` ADD `city` varchar(100);