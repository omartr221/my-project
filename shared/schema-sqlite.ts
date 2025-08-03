import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  supervisor: text("supervisor"),
  assistant: text("assistant"),
  engineer: text("engineer"),
  nationalId: text("national_id"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isPredefined: integer("is_predefined", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskNumber: text("task_number").unique().notNull(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  workerRole: text("worker_role").notNull().default("technician"),
  description: text("description").notNull(),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  estimatedDuration: integer("estimated_duration"),
  engineerName: text("engineer_name"),
  supervisorName: text("supervisor_name"),
  technicianName: text("technician_name"),
  assistantName: text("assistant_name"),
  technicians: text("technicians"), // JSON string
  assistants: text("assistants"), // JSON string
  repairOperation: text("repair_operation"),
  taskType: text("task_type"),
  color: text("color"),
  timerType: text("timer_type").notNull().default("automatic"),
  consumedTime: integer("consumed_time"),
  status: text("status").notNull().default("active"),
  startTime: text("start_time").default("CURRENT_TIMESTAMP"),
  endTime: text("end_time"),
  pausedAt: text("paused_at"),
  pauseReason: text("pause_reason"),
  pauseNotes: text("pause_notes"),
  totalPausedDuration: integer("total_paused_duration").default(0),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  archivedAt: text("archived_at"),
  archivedBy: text("archived_by"),
  archiveNotes: text("archive_notes"),
  rating: integer("rating"),
  deliveryNumber: integer("delivery_number"),
  isCancelled: integer("is_cancelled", { mode: "boolean" }).default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: text("cancelled_at"),
  cancelledBy: text("cancelled_by"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration"),
  entryType: text("entry_type").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const customerCars = sqliteTable("customer_cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  chassisNumber: text("chassis_number"),
  engineCode: text("engine_code"),
  year: integer("year"),
  color: text("color"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  permissions: text("permissions").default("[]"), // JSON string
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const partsRequests = sqliteTable("parts_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestNumber: text("request_number").unique().notNull(),
  engineerName: text("engineer_name").notNull(),
  carInfo: text("car_info").notNull(),
  carBrand: text("car_brand"),
  carModel: text("car_model"),
  licensePlate: text("license_plate"),
  chassisNumber: text("chassis_number"),
  engineCode: text("engine_code"),
  reasonType: text("reason_type").notNull(),
  partName: text("part_name").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  userNotes: text("user_notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const carReceipts = sqliteTable("car_receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptNumber: text("receipt_number").unique().notNull(),
  licensePlate: text("license_plate").notNull(),
  customerName: text("customer_name").notNull(),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  carColor: text("car_color"),
  chassisNumber: text("chassis_number"),
  engineCode: text("engine_code"),
  entryMileage: text("entry_mileage").notNull(),
  fuelLevel: text("fuel_level").notNull(),
  entryNotes: text("entry_notes"),
  repairType: text("repair_type").notNull(),
  receivedBy: text("received_by").notNull(),
  receivedAt: text("received_at").default("CURRENT_TIMESTAMP"),
  status: text("status").notNull().default("received"),
  workshopNotificationSent: integer("workshop_notification_sent", { mode: "boolean" }).default(false),
  sentToWorkshopAt: text("sent_to_workshop_at"),
  sentToWorkshopBy: text("sent_to_workshop_by"),
  postponedAt: text("postponed_at"),
  postponedBy: text("postponed_by"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Relations
export const workersRelations = relations(workers, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  worker: one(workers, {
    fields: [tasks.workerId],
    references: [workers.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  cars: many(customerCars),
}));

export const customerCarsRelations = relations(customerCars, ({ one }) => ({
  customer: one(customers, {
    fields: [customerCars.customerId],
    references: [customers.id],
  }),
}));

// Insert schemas
export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
}).extend({
  nationalId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  taskNumber: true,
  createdAt: true,
  startTime: true,
}).extend({
  estimatedDuration: z.number().optional(),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().optional(),
  technicians: z.string().optional(), // JSON string
  assistants: z.string().optional(), // JSON string
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
  color: z.string().optional(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerCarSchema = createInsertSchema(customerCars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartsRequestSchema = createInsertSchema(partsRequests).omit({
  id: true,
  requestNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCarReceiptSchema = createInsertSchema(carReceipts).omit({
  id: true,
  receiptNumber: true,
  createdAt: true,
});

// Types
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type CustomerCar = typeof customerCars.$inferSelect;
export type InsertCustomerCar = z.infer<typeof insertCustomerCarSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PartsRequest = typeof partsRequests.$inferSelect;
export type InsertPartsRequest = z.infer<typeof insertPartsRequestSchema>;

export type CarReceipt = typeof carReceipts.$inferSelect;
export type InsertCarReceipt = z.infer<typeof insertCarReceiptSchema>;

// Complex types
export type WorkerWithTasks = Worker & {
  tasks: Task[];
  currentTask?: Task;
  totalWorkTime: number;
  isAvailable: boolean;
};

export type TaskWithWorker = Task & {
  worker: Worker;
};

export type TaskHistory = Task;

export type CustomerWithCars = Customer & {
  cars: CustomerCar[];
};