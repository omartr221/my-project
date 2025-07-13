import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // فني، مساعد، مشرف، فني تحت الإشراف
  supervisor: varchar("supervisor", { length: 100 }),
  assistant: varchar("assistant", { length: 100 }),
  engineer: varchar("engineer", { length: 100 }),
  nationalId: varchar("national_id", { length: 20 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: varchar("address", { length: 255 }),
  isActive: boolean("is_active").default(true),
  isPredefined: boolean("is_predefined").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  taskNumber: varchar("task_number", { length: 20 }).unique().notNull(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  workerRole: varchar("worker_role", { length: 50 }).notNull().default("technician"), // assistant, technician, supervisor, engineer
  description: varchar("description", { length: 500 }).notNull(),
  carBrand: varchar("car_brand", { length: 50 }).notNull(), // audi, seat, skoda, volkswagen
  carModel: varchar("car_model", { length: 100 }).notNull(),
  licensePlate: varchar("license_plate", { length: 20 }).notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  engineerName: varchar("engineer_name", { length: 100 }),
  supervisorName: varchar("supervisor_name", { length: 100 }),
  technicianName: varchar("technician_name", { length: 100 }),
  assistantName: varchar("assistant_name", { length: 100 }),
  technicians: text("technicians").array(), // Array of technician names
  assistants: text("assistants").array(), // Array of assistant names
  repairOperation: varchar("repair_operation", { length: 200 }),
  taskType: varchar("task_type", { length: 20 }), // ميكانيك, كهربا
  color: varchar("color", { length: 20 }), // اللون
  timerType: varchar("timer_type", { length: 20 }).notNull().default("automatic"), // automatic, manual
  consumedTime: integer("consumed_time"), // in minutes - for manual timer
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, completed, archived
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  pausedAt: timestamp("paused_at"),
  pauseReason: varchar("pause_reason", { length: 100 }),
  pauseNotes: varchar("pause_notes", { length: 500 }),
  totalPausedDuration: integer("total_paused_duration").default(0), // in seconds
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by", { length: 100 }),
  archiveNotes: varchar("archive_notes", { length: 1000 }),
  rating: integer("rating"), // 1-3 stars rating
  deliveryNumber: integer("delivery_number"), // Sequential number for delivered tasks
  isCancelled: boolean("is_cancelled").default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: varchar("cancelled_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  entryType: varchar("entry_type", { length: 20 }).notNull(), // work, pause
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerCars = pgTable("customer_cars", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  color: text("color"),
  year: integer("year"),
  engineCode: text("engine_code"),
  chassisNumber: text("chassis_number"),
  previousOwner: text("previous_owner"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
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



// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  permissions: text("permissions").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});





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
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
}).partial({
  assistantName: true,
  engineerName: true,
  supervisorName: true,
  technicianName: true,
  repairOperation: true,
  taskType: true,
  color: true,
  timerType: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "يجب إدخال اسم الزبون"),
  phoneNumber: z.string().min(1, "يجب إدخال رقم الهاتف"),
});

export const insertCustomerCarSchema = createInsertSchema(customerCars).omit({
  id: true,
  createdAt: true,
}).extend({
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
}).partial({
  engineCode: true,
  chassisNumber: true,
});

export const partsRequests = pgTable("parts_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).unique(),
  engineerName: varchar("engineer_name", { length: 100 }).notNull(),
  carInfo: varchar("car_info", { length: 255 }).notNull(), // License plate, chassis number, or customer name
  carBrand: varchar("car_brand", { length: 50 }),
  carModel: varchar("car_model", { length: 100 }),
  licensePlate: varchar("license_plate", { length: 50 }), // رقم السيارة
  chassisNumber: varchar("chassis_number", { length: 100 }), // رقم الشاسيه
  engineCode: varchar("engine_code", { length: 50 }), // رمز المحرك
  reasonType: varchar("reason_type", { length: 50 }).notNull(), // "expense" or "loan"
  partName: varchar("part_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected, delivered
  notes: text("notes"),
  requestedBy: varchar("requested_by", { length: 100 }),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedBy: varchar("approved_by", { length: 100 }),
  approvedAt: timestamp("approved_at"),
  deliveredBy: varchar("delivered_by", { length: 100 }),
  deliveredAt: timestamp("delivered_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartsRequestSchema = createInsertSchema(partsRequests).omit({
  id: true,
  requestNumber: true,
  requestedAt: true,
  approvedAt: true,
  deliveredAt: true,
}).extend({
  engineerName: z.string().min(1, "يجب اختيار المهندس"),
  carInfo: z.string().min(1, "يجب إدخال معلومات السيارة"),
  reasonType: z.string().min(1, "يجب اختيار سبب الطلب"),
  partName: z.string().min(1, "يجب إدخال اسم القطعة"),
  quantity: z.number().min(1, "يجب إدخال العدد"),
}).partial({
  carBrand: true,
  carModel: true,
  licensePlate: true,
  chassisNumber: true,
  engineCode: true,
  notes: true,
  requestedBy: true,
  approvedBy: true,
  deliveredBy: true,
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

// Extended types for API responses
export type WorkerWithTasks = Worker & {
  tasks: Task[];
  currentTask?: Task;
  totalWorkTime: number;
  isAvailable: boolean;
};

export type TaskWithWorker = Task & {
  worker: Worker;
  currentDuration: number;
};

export type TaskHistory = Task & {
  worker: Worker;
  totalDuration: number;
};

export type CustomerWithCars = Customer & {
  cars: CustomerCar[];
};
