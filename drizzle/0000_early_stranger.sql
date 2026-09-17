CREATE TABLE `vehicle_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`object_key` text,
	`image_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_images_vehicle_id` ON `vehicle_images` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`version` text DEFAULT '' NOT NULL,
	`year` integer NOT NULL,
	`mileage` integer DEFAULT 0 NOT NULL,
	`transmission` text DEFAULT 'Manual' NOT NULL,
	`fuel` text DEFAULT 'Flex' NOT NULL,
	`category` text DEFAULT 'hatch' NOT NULL,
	`condition` text DEFAULT 'usado' NOT NULL,
	`sale_enabled` integer DEFAULT true NOT NULL,
	`rental_enabled` integer DEFAULT false NOT NULL,
	`sale_price` integer,
	`rental_price` integer,
	`description` text DEFAULT '' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_promotion` integer DEFAULT false NOT NULL,
	`promotional_price` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicles_status` ON `vehicles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_vehicles_promotion` ON `vehicles` (`is_promotion`);