import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 100 }).notNull(),
  category: text("category", { length: 50 }).notNull(), // فني، مساعد، مشرف، فني تحت الإشراف
  supervisor: text("supervisor", { length: 100 }),
  assistant: text("assistant", { length: 100 }),
  engineer: text("engineer", { length: 100 }),
  nationalId: text("national_id", { length: 20 }),
  phoneNumber: text("phone_number", { length: 20 }),
  address: text("address", { length: 255 }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isPredefined: integer("is_predefined", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskNumber: text("task_number", { length: 20 }).unique().notNull(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  workerRole: text("worker_role", { length: 50 }).notNull().default("technician"), // assistant, technician, supervisor, engineer
  description: text("description", { length: 500 }).notNull(),
  carBrand: text("car_brand", { length: 50 }).notNull(), // audi, seat, skoda, volkswagen
  carModel: text("car_model", { length: 100 }).notNull(),
  licensePlate: text("license_plate", { length: 20 }).notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  engineerName: text("engineer_name", { length: 100 }),
  supervisorName: text("supervisor_name", { length: 100 }),
  technicianName: text("technician_name", { length: 100 }),
  assistantName: text("assistant_name", { length: 100 }),
  technicians: text("technicians"), // JSON array of technician names
  assistants: text("assistants"), // JSON array of assistant names
  repairOperation: text("repair_operation", { length: 200 }),
  taskType: text("task_type", { length: 20 }), // ميكانيك, كهربا
  color: text("color", { length: 20 }), // اللون
  timerType: text("timer_type", { length: 20 }).notNull().default("automatic"), // automatic, manual
  consumedTime: integer("consumed_time"), // in minutes - for manual timer
  status: text("status", { length: 20 }).notNull().default("active"), // active, paused, completed, archived
  startTime: text("start_time").default("CURRENT_TIMESTAMP"),
  endTime: text("end_time"),
  pausedAt: text("paused_at"),
  pauseReason: text("pause_reason", { length: 100 }),
  pauseNotes: text("pause_notes", { length: 500 }),
  totalPausedDuration: integer("total_paused_duration").default(0), // in seconds
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  archivedAt: text("archived_at"),
  archivedBy: text("archived_by", { length: 100 }),
  archiveNotes: text("archive_notes", { length: 1000 }),
  rating: integer("rating"), // 1-3 stars rating
  deliveryNumber: integer("delivery_number"), // Sequential number for delivered tasks
  isCancelled: integer("is_cancelled", { mode: "boolean" }).default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: text("cancelled_at"),
  cancelledBy: text("cancelled_by", { length: 100 }),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration"), // in seconds
  entryType: text("entry_type", { length: 20 }).notNull(), // work, pause
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  location: text("location"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const customerCars = sqliteTable("customer_cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  carBrand: text("car_brand", { length: 50 }).notNull(),
  carModel: text("car_model", { length: 100 }).notNull(),
  licensePlate: text("license_plate", { length: 20 }).notNull(),
  chassisNumber: text("chassis_number", { length: 100 }),
  engineCode: text("engine_code", { length: 100 }),
  year: integer("year"),
  color: text("color", { length: 50 }),
  notes: text("notes"),
  previousOwner: text("previous_owner"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username", { length: 50 }).notNull().unique(),
  password: text("password", { length: 255 }).notNull(),
  role: text("role", { length: 50 }).notNull(),
  permissions: text("permissions"), // JSON array of permissions
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const carReceipts = sqliteTable("car_receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptNumber: text("receipt_number", { length: 20 }).unique().notNull(),
  licensePlate: text("license_plate", { length: 20 }).notNull(),
  customerName: text("customer_name", { length: 100 }).notNull(),
  carBrand: text("car_brand", { length: 50 }).notNull(),
  carModel: text("car_model", { length: 100 }).notNull(),
  carColor: text("car_color", { length: 50 }),
  chassisNumber: text("chassis_number", { length: 100 }),
  engineCode: text("engine_code", { length: 100 }),
  entryMileage: text("entry_mileage").notNull(), // عداد الدخول
  fuelLevel: text("fuel_level", { length: 20 }).notNull(), // نسبة البنزين
  entryNotes: text("entry_notes"), // ملاحظات عند الدخول
  repairType: text("repair_type").notNull(), // طلبات الإصلاح المتعددة
  receivedBy: text("received_by", { length: 100 }).notNull(),
  receivedAt: text("received_at").default("CURRENT_TIMESTAMP"),
  status: text("status", { length: 20 }).notNull().default("received"), // received, workshop_pending, postponed, in_workshop, completed
  workshopNotificationSent: integer("workshop_notification_sent", { mode: "boolean" }).default(false),
  sentToWorkshopAt: text("sent_to_workshop_at"),
  sentToWorkshopBy: text("sent_to_workshop_by", { length: 100 }),
  postponedAt: text("postponed_at"),
  postponedBy: text("postponed_by", { length: 100 }),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const partsRequests = sqliteTable("parts_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestNumber: text("request_number", { length: 20 }).unique(),
  engineerName: text("engineer_name", { length: 100 }).notNull(),
  customerName: text("customer_name", { length: 100 }),
  carInfo: text("car_info").notNull(),
  carBrand: text("car_brand", { length: 50 }),
  carModel: text("car_model", { length: 100 }),
  licensePlate: text("license_plate", { length: 20 }),
  chassisNumber: text("chassis_number", { length: 100 }),
  engineCode: text("engine_code", { length: 100 }),
  reasonType: text("reason_type", { length: 50 }).notNull(),
  partName: text("part_name", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status", { length: 30 }).default("pending"),
  notes: text("notes"),
  requestedBy: text("requested_by", { length: 100 }),
  requestedAt: text("requested_at").default("CURRENT_TIMESTAMP"),
  approvedBy: text("approved_by", { length: 100 }),
  approvedAt: text("approved_at"),
  inPreparationAt: text("in_preparation_at"),
  readyForPickupAt: text("ready_for_pickup_at"),
  orderedExternallyAt: text("ordered_externally_at"),
  orderedExternallyBy: text("ordered_externally_by", { length: 100 }),
  estimatedArrival: text("estimated_arrival"),
  partsArrivedAt: text("parts_arrived_at"),
  partsArrivedBy: text("parts_arrived_by", { length: 100 }),
  unavailableAt: text("unavailable_at"),
  unavailableBy: text("unavailable_by", { length: 100 }),
  deliveredBy: text("delivered_by", { length: 100 }),
  deliveredAt: text("delivered_at"),
  returnedAt: text("returned_at"),
  returnedBy: text("returned_by", { length: 100 }),
  returnReason: text("return_reason"),
  userNotes: text("user_notes"),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id", { length: 100 }).notNull(), // اسم المستخدم المراد إشعاره
  type: text("type", { length: 50 }).notNull(), // نوع الإشعار: parts_request_created, task_assigned, etc.
  title: text("title", { length: 200 }).notNull(), // عنوان الإشعار
  message: text("message").notNull(), // نص الإشعار
  relatedId: integer("related_id"), // معرف العنصر المرتبط (مثل رقم الطلب)
  relatedType: text("related_type", { length: 50 }), // نوع العنصر المرتبط: parts_request, task, etc.
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  readAt: text("read_at"),
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
  estimatedDuration: z.number().min(1).max(480),
  description: z.string().min(3, "الوصف مطلوب"),
  carBrand: z.enum(["audi", "seat", "skoda", "volkswagen"]),
  licensePlate: z.string().min(1, "رقم اللوحة مطلوب"),
  carModel: z.string().min(1, "موديل السيارة مطلوب"),
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

export const insertCarReceiptSchema = createInsertSchema(carReceipts).omit({
  id: true,
  receiptNumber: true,
  createdAt: true,
  receivedAt: true,
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
  customerName: true,
  carBrand: true,
  carModel: true,
  licensePlate: true,
  chassisNumber: true,
  engineCode: true,
  notes: true,
  requestedBy: true,
  approvedBy: true,
  inPreparationAt: true,
  readyForPickupAt: true,
  orderedExternallyAt: true,
  orderedExternallyBy: true,
  estimatedArrival: true,
  partsArrivedAt: true,
  partsArrivedBy: true,
  unavailableAt: true,
  unavailableBy: true,
  deliveredBy: true,
  returnedAt: true,
  returnedBy: true,
  returnReason: true,
  userNotes: true,
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
export type CarReceipt = typeof carReceipts.$inferSelect;
export type InsertCarReceipt = z.infer<typeof insertCarReceiptSchema>;
export type PartsRequest = typeof partsRequests.$inferSelect;
export type InsertPartsRequest = z.infer<typeof insertPartsRequestSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Extended types
export type WorkerWithTasks = Worker & { tasks: Task[] };
export type TaskWithWorker = Task & { worker: Worker };
export type TaskHistory = Task & { worker: Worker };
export type CustomerWithCars = Customer & { cars: CustomerCar[] };