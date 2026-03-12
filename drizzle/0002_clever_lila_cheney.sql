ALTER TABLE `categories` ADD `nameAr` varchar(100);--> statement-breakpoint
ALTER TABLE `categories` ADD `descriptionAr` text;--> statement-breakpoint
ALTER TABLE `professions` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `professions` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `professions` ADD `hasOffice` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `professions` ADD `officeAddress` text;--> statement-breakpoint
ALTER TABLE `professions` ADD `officeCity` varchar(100);--> statement-breakpoint
ALTER TABLE `professions` ADD `officeCountry` varchar(100);--> statement-breakpoint
ALTER TABLE `services` ADD `nameAr` varchar(100);--> statement-breakpoint
ALTER TABLE `services` ADD `descriptionAr` text;--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','ar') DEFAULT 'en';