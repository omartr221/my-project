import { pgTable, text, integer, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // فني، مساعد، مشرف، فني تحت الإشراف
  supervisor: text("supervisor"),
  assistant: text("assistant"),
  engineer: text("engineer"),
  nationalId: text("national_id"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  isPredefined: boolean("is_predefined").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
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
  supervisors: text("supervisors"), // JSON string of supervisor names
  technicians: text("technicians"), // JSON string of technician names
  assistants: text("assistants"), // JSON string of assistant names
  repairOperation: text("repair_operation"),
  taskType: text("task_type"), // ميكانيك, كهربا
  invoiceType: text("invoice_type"), // NB, NBP, NBC - اختياري
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
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: text("archived_by"),
  archiveNotes: text("archive_notes"),
  rating: integer("rating"), // 1-3 stars rating
  deliveryNumber: integer("delivery_number"), // Sequential number for delivered tasks
  dueDate: text("due_date"), // تاريخ انتهاء المهمة
  isCancelled: boolean("is_cancelled").default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: text("cancelled_at"),
  cancelledBy: text("cancelled_by"),
  // حقول الترحيل
  isTransferred: boolean("is_transferred").default(false),
  transferredAt: timestamp("transferred_at"),
  transferredBy: text("transferred_by"),
  transferNotes: text("transfer_notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration"), // in seconds
  entryType: text("entry_type").notNull(), // work, pause
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  notes: text("notes"),
  customerStatus: text("customer_status").default("A"), // A, B, C
  isFavorite: boolean("is_favorite").default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const customerCars = pgTable("customer_cars", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  previousLicensePlate: text("previous_license_plate"), // رقم اللوحة السابق
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
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  permissions: text("permissions"), // JSON string of permissions array
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const maintenanceGuides = pgTable("maintenance_guides", {
  id: serial("id").primaryKey(),
  carBrand: text("car_brand").notNull(), // audi, seat, skoda, volkswagen
  carPart: text("car_part").notNull(), // engine, brakes, exhaust, transmission, etc.
  title: text("title").notNull(),
  content: text("content").notNull(), // Detailed maintenance steps
  tools: text("tools"), // JSON string of required tools
  safetyTips: text("safety_tips"), // JSON string of safety instructions
  estimatedTime: integer("estimated_time"), // in minutes
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  generatedAt: timestamp("generated_at").defaultNow(),
  lastUsed: timestamp("last_used"),
  useCount: integer("use_count").default(0),
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
  technicians: true,
  assistants: true,
  supervisors: true,
}).extend({
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  invoiceType: z.string().optional(),
  // Accept arrays for team members from frontend
  technicians: z.array(z.string()).optional(),
  assistants: z.array(z.string()).optional(),
  supervisors: z.array(z.string()).optional(),
}).partial({
  assistantName: true,
  engineerName: true,
  supervisorName: true,
  technicianName: true,
  repairOperation: true,
  taskType: true,
  invoiceType: true,
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
  customerStatus: z.enum(["A", "B", "C"]).default("A"),
});

export const insertCustomerCarSchema = createInsertSchema(customerCars).omit({
  id: true,
  createdAt: true,
}).extend({
  carBrand: z.string().min(1, "يجب اختيار الصانع"),
  carModel: z.string().min(1, "يجب إدخال الطراز"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
}).partial({
  engineCode: true,
  chassisNumber: true,
  previousLicensePlate: true,
});

export const partsRequests = pgTable("parts_requests", {
  id: serial("id").primaryKey(),
  requestNumber: text("request_number").unique(),
  engineerName: text("engineer_name").notNull(),
  customerName: text("customer_name"), // اسم الزبون
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
  forWorkshop: text("for_workshop"), // للورشة - اختياري
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
  customerName: true,
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
  forWorkshop: true,
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

// Reception entries table for car intake workflow
export const receptionEntries = pgTable("reception_entries", {
  id: serial("id").primaryKey(),
  carOwnerName: text("car_owner_name").notNull(),
  licensePlate: text("license_plate").notNull(),
  serviceType: text("service_type").notNull(), // نوع الصيانة
  complaints: text("complaints"), // الشكاوي والأعطال
  odometerReading: integer("odometer_reading"), // عداد الكيلومترات
  fuelLevel: text("fuel_level").notNull(), // مستوى البنزين كنص يدوي
  status: text("status").notNull().default("reception"), // reception, workshop, completed
  receptionUserId: integer("reception_user_id").references(() => users.id),
  workshopUserId: integer("workshop_user_id").references(() => users.id),
  entryTime: timestamp("entry_time").defaultNow(),
  workshopEntryTime: timestamp("workshop_entry_time"),
  customerId: integer("customer_id").references(() => customers.id),
  carId: integer("car_id").references(() => customerCars.id),
});

// Reception relations
export const receptionEntriesRelations = relations(receptionEntries, ({ one }) => ({
  customer: one(customers, {
    fields: [receptionEntries.customerId],
    references: [customers.id],
  }),
  car: one(customerCars, {
    fields: [receptionEntries.carId],
    references: [customerCars.id],
  }),
  receptionUser: one(users, {
    fields: [receptionEntries.receptionUserId],
    references: [users.id],
  }),
  workshopUser: one(users, {
    fields: [receptionEntries.workshopUserId],
    references: [users.id],
  }),
}));

// Insert schema for reception entries
export const insertReceptionEntrySchema = createInsertSchema(receptionEntries).omit({
  id: true,
  entryTime: true,
  workshopEntryTime: true,
}).extend({
  carOwnerName: z.string().min(1, "يجب إدخال اسم صاحب السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم السيارة"),
  serviceType: z.string().min(1, "يجب تحديد نوع الصيانة"),
  odometerReading: z.number().min(0, "يجب إدخال قراءة العداد"),
  fuelLevel: z.string().min(1, "يجب إدخال مستوى البنزين"),
}).partial({
  complaints: true,
  customerId: true,
  carId: true,
  receptionUserId: true,
  workshopUserId: true,
});

export type ReceptionEntry = typeof receptionEntries.$inferSelect;
export type InsertReceptionEntry = z.infer<typeof insertReceptionEntrySchema>;

// Car Status Table - تتبع وضع السيارات بشكل آني
export const carStatus = pgTable("car_status", {
  id: serial("id").primaryKey(),

  customerName: text("customer_name").notNull(),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate").notNull(),
  currentStatus: text("current_status").notNull().default("في الاستقبال"), // في الاستقبال، في الورشة، بانتظار قطع، جاهزة للتسليم
  maintenanceType: text("maintenance_type"), // نوع الصيانة
  complaints: text("complaints"), // الشكاوي
  kmReading: integer("km_reading"), // عداد الكيلومترات
  fuelLevel: text("fuel_level"), // مستوى البنزين
  partsRequestsCount: integer("parts_requests_count").default(0), // عدد طلبات القطع
  completedPartsCount: integer("completed_parts_count").default(0), // عدد القطع المكتملة
  receivedAt: timestamp("received_at").defaultNow(), // وقت الاستقبال
  enteredWorkshopAt: timestamp("entered_workshop_at"), // وقت دخول الورشة
  completedAt: timestamp("completed_at"), // وقت الانتهاء
  returnedToReceptionAt: timestamp("returned_to_reception_at"), // وقت الإرجاع للاستقبال
  returnedBy: text("returned_by"), // من قام بالإرجاع
  deliveredAt: timestamp("delivered_at"), // وقت التسليم
  updatedAt: timestamp("updated_at").defaultNow(), // آخر تحديث
  createdAt: timestamp("created_at").defaultNow(),
});



// Insert schema for car status
export const insertCarStatusSchema = createInsertSchema(carStatus).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
}).extend({
  customerName: z.string().min(1, "يجب إدخال اسم الزبون"),
  licensePlate: z.string().min(1, "يجب إدخال رقم السيارة"),
  carBrand: z.string().min(1, "يجب تحديد نوع السيارة"),
  carModel: z.string().min(1, "يجب تحديد موديل السيارة"),
  currentStatus: z.enum(["في الاستقبال", "في الورشة", "بانتظار قطع", "جاهزة للتسليم"]),
});

export type CarStatus = typeof carStatus.$inferSelect;
export type InsertCarStatus = z.infer<typeof insertCarStatusSchema>;

// Insert schema for maintenance guides
export const insertMaintenanceGuideSchema = createInsertSchema(maintenanceGuides).omit({
  id: true,
  generatedAt: true,
  lastUsed: true,
  useCount: true,
}).extend({
  carBrand: z.enum(["audi", "seat", "skoda", "volkswagen"]),
  carPart: z.string().min(1, "يجب تحديد قطعة السيارة"),
  title: z.string().min(1, "يجب إدخال عنوان دليل الصيانة"),
  content: z.string().min(1, "يجب إدخال محتوى دليل الصيانة"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export type MaintenanceGuide = typeof maintenanceGuides.$inferSelect;
export type InsertMaintenanceGuide = z.infer<typeof insertMaintenanceGuideSchema>;
