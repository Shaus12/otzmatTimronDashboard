CREATE TABLE `records` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'פתוח' NOT NULL,
	`due` text DEFAULT '' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`assignee` text DEFAULT '' NOT NULL,
	`updated` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_vehicle_assignment` ON `records` (`user_id`,`assignee`) WHERE "records"."kind" = 'vehicles' AND "records"."assignee" <> '' AND "records"."deleted" = 0;