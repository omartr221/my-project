import { sqliteTable, text, integer, numeric, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // فني، مساعد، مشرف، فني تحت الإشراف
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
  taskNumber: text("task_number").notNull().unique(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  workerRole: text("worker_role").notNull().default("technician"), // assistant, technician, supervisor, engineer
  description: text("description").notNull(),
  carBrand: text("car_brand").notNull(), // audi, seat, skoda, volkswagen
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  engineerName: text("engineer_name"),
  supervisorName: text("supervisor_name"),
  technicianName: text("technician_name"),
  assistantName: text("assistant_name"),
  technicians: text("technicians"), // JSON string of technician names
  assistants: text("assistants"), // JSON string of assistant names
  repairOperation: text("repair_operation"),
  taskType: text("task_type"), // ميكانيك, كهربا
  color: text("color"), // اللون
  timerType: text("timer_type").notNull().default("automatic"), // automatic, manual
  consumedTime: integer("consumed_time"), // in minutes - for manual timer
  status: text("status").notNull().default("active"), // active, paused, completed, archived
  startTime: text("start_time").default("CURRENT_TIMESTAMP"),
  endTime: text("end_time"),
  pausedAt: text("paused_at"),
  pauseReason: text("pause_reason"),
  pauseNotes: text("pause_notes"),
  totalPausedDuration: integer("total_paused_duration").default(0), // in seconds
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  archivedAt: text("archived_at"),
  archivedBy: text("archived_by"),
  archiveNotes: text("archive_notes"),
  rating: integer("rating"), // 1-3 stars rating
  deliveryNumber: integer("delivery_number"), // Sequential number for delivered tasks
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
  duration: integer("duration"), // in seconds
  entryType: text("entry_type").notNull(), // work, pause
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customerCars = sqliteTable("customer_cars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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



// Users table for authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  permissions: text("permissions"), // JSON string of permissions array
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
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
  entryMileage: text("entry_mileage").notNull(), // عداد الدخول
  fuelLevel: text("fuel_level").notNull(), // نسبة البنزين
  entryNotes: text("entry_notes"), // ملاحظات عند الدخول
  repairType: text("repair_type").notNull(), // طلبات الإصلاح المتعددة
  receivedBy: text("received_by").notNull(),
  receivedAt: text("received_at").default("CURRENT_TIMESTAMP"),
  status: text("status").notNull().default("received"), // received, workshop_pending, postponed, in_workshop, completed
  workshopNotificationSent: integer("workshop_notification_sent", { mode: "boolean" }).default(false),
  sentToWorkshopAt: text("sent_to_workshop_at"),
  sentToWorkshopBy: text("sent_to_workshop_by"),
  postponedAt: text("postponed_at"),
  postponedBy: text("postponed_by"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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

export const partsRequests = sqliteTable("parts_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestNumber: text("request_number").unique(),
  engineerName: text("engineer_name").notNull(),
  carInfo: text("car_info").notNull(), // License plate, chassis number, or customer name
  carBrand: text("car_brand"),
  carModel: text("car_model"),
  licensePlate: text("license_plate"), // رقم السيارة
  chassisNumber: text("chassis_number"), // رقم الشاسيه
  engineCode: text("engine_code"), // رمز المحرك
  reasonType: text("reason_type").notNull(), // "expense" or "loan"
  partName: text("part_name").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected, delivered
  notes: text("notes"),
  requestedBy: text("requested_by"),
  requestedAt: text("requested_at").default("CURRENT_TIMESTAMP"),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  inPreparationAt: text("in_preparation_at"),
  readyForPickupAt: text("ready_for_pickup_at"),
  orderedExternallyAt: text("ordered_externally_at"),
  orderedExternallyBy: text("ordered_externally_by"),
  estimatedArrival: text("estimated_arrival"),
  partsArrivedAt: text("parts_arrived_at"),
  partsArrivedBy: text("parts_arrived_by"),
  unavailableAt: text("unavailable_at"),
  unavailableBy: text("unavailable_by"),
  deliveredBy: text("delivered_by"),
  deliveredAt: text("delivered_at"),
  returnedAt: text("returned_at"),
  returnedBy: text("returned_by"),
  returnReason: text("return_reason"),
  userNotes: text("user_notes"),
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
  returnedAt: true,
  returnedBy: true,
  returnReason: true,
  userNotes: true,
});

// Base types from database
export type WorkerDB = typeof workers.$inferSelect;
export type TaskDB = typeof tasks.$inferSelect;
export type UserDB = typeof users.$inferSelect;

// Application types with parsed arrays
export type Worker = WorkerDB;
export type Task = Omit<TaskDB, 'technicians' | 'assistants'> & {
  technicians: string[];
  assistants: string[];
};
export type User = Omit<UserDB, 'permissions'> & {
  permissions: string[];
};

// Insert types
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Other types
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerCar = typeof customerCars.$inferSelect;
export type InsertCustomerCar = z.infer<typeof insertCustomerCarSchema>;
export type PartsRequest = typeof partsRequests.$inferSelect;
export type InsertPartsRequest = z.infer<typeof insertPartsRequestSchema>;

export const insertCarReceiptSchema = createInsertSchema(carReceipts).omit({
  id: true,
  receiptNumber: true,
  receivedAt: true,
  createdAt: true,
  status: true,
  workshopNotificationSent: true,
  sentToWorkshopAt: true,
  sentToWorkshopBy: true,
  postponedAt: true,
  postponedBy: true,
}).extend({
  licensePlate: z.string().min(1, "يجب إدخال رقم السيارة"),
  customerName: z.string().min(1, "يجب إدخال اسم الزبون"),
  carBrand: z.string().min(1, "يجب إدخال ماركة السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  entryMileage: z.string().min(1, "يجب إدخال قراءة العداد"),
  fuelLevel: z.string().min(1, "يجب اختيار نسبة البنزين"),
  repairType: z.string().min(1, "يجب إدخال طلبات الإصلاح"),
}).partial({
  carColor: true,
  chassisNumber: true,
  engineCode: true,
  entryNotes: true,
  receivedBy: true,
});

export type CarReceipt = typeof carReceipts.$inferSelect;
export type InsertCarReceipt = z.infer<typeof insertCarReceiptSchema>;

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
