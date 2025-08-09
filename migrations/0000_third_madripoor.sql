CREATE TABLE "car_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_number" text NOT NULL,
	"license_plate" text NOT NULL,
	"customer_name" text NOT NULL,
	"car_brand" text NOT NULL,
	"car_model" text NOT NULL,
	"car_color" text,
	"chassis_number" text,
	"engine_code" text,
	"entry_mileage" text NOT NULL,
	"fuel_level" text NOT NULL,
	"entry_notes" text,
	"repair_type" text NOT NULL,
	"received_by" text NOT NULL,
	"received_at" text DEFAULT 'CURRENT_TIMESTAMP',
	"status" text DEFAULT 'received' NOT NULL,
	"workshop_notification_sent" integer DEFAULT false,
	"sent_to_workshop_at" text,
	"sent_to_workshop_by" text,
	"postponed_at" text,
	"postponed_by" text,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT "car_receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "customer_cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"car_brand" text NOT NULL,
	"car_model" text NOT NULL,
	"license_plate" text NOT NULL,
	"previous_license_plate" text,
	"color" text,
	"year" integer,
	"engine_code" text,
	"chassis_number" text,
	"previous_owner" text,
	"notes" text,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"address" text,
	"notes" text,
	"customer_status" text DEFAULT 'A',
	"is_favorite" integer DEFAULT false,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE "parts_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_number" text,
	"engineer_name" text NOT NULL,
	"customer_name" text,
	"car_info" text NOT NULL,
	"car_brand" text,
	"car_model" text,
	"license_plate" text,
	"chassis_number" text,
	"engine_code" text,
	"reason_type" text NOT NULL,
	"part_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"notes" text,
	"requested_by" text,
	"requested_at" text DEFAULT 'CURRENT_TIMESTAMP',
	"approved_by" text,
	"approved_at" text,
	"in_preparation_at" text,
	"ready_for_pickup_at" text,
	"ordered_externally_at" text,
	"ordered_externally_by" text,
	"estimated_arrival" text,
	"parts_arrived_at" text,
	"parts_arrived_by" text,
	"unavailable_at" text,
	"unavailable_by" text,
	"delivered_by" text,
	"delivered_at" text,
	"returned_at" text,
	"returned_by" text,
	"return_reason" text,
	"user_notes" text,
	CONSTRAINT "parts_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_number" text NOT NULL,
	"worker_id" integer NOT NULL,
	"worker_role" text DEFAULT 'technician' NOT NULL,
	"description" text NOT NULL,
	"car_brand" text NOT NULL,
	"car_model" text NOT NULL,
	"license_plate" text NOT NULL,
	"estimated_duration" integer,
	"engineer_name" text,
	"supervisor_name" text,
	"technician_name" text,
	"assistant_name" text,
	"technicians" text,
	"assistants" text,
	"repair_operation" text,
	"task_type" text,
	"color" text,
	"timer_type" text DEFAULT 'automatic' NOT NULL,
	"consumed_time" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"start_time" text DEFAULT 'CURRENT_TIMESTAMP',
	"end_time" text,
	"paused_at" text,
	"pause_reason" text,
	"pause_notes" text,
	"total_paused_duration" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false,
	"archived_at" timestamp,
	"archived_by" text,
	"archive_notes" text,
	"rating" integer,
	"delivery_number" integer,
	"is_cancelled" boolean DEFAULT false,
	"cancellation_reason" text,
	"cancelled_at" text,
	"cancelled_by" text,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT "tasks_task_number_unique" UNIQUE("task_number")
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text,
	"duration" integer,
	"entry_type" text NOT NULL,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"permissions" text,
	"created_at" text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	"updated_at" text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"supervisor" text,
	"assistant" text,
	"engineer" text,
	"national_id" text,
	"phone_number" text,
	"address" text,
	"is_active" boolean DEFAULT true,
	"is_predefined" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_cars" ADD CONSTRAINT "customer_cars_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;