var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  customerCars: () => customerCars,
  customerCarsRelations: () => customerCarsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  insertCustomerCarSchema: () => insertCustomerCarSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertPartsRequestSchema: () => insertPartsRequestSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTimeEntrySchema: () => insertTimeEntrySchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkerSchema: () => insertWorkerSchema,
  partsRequests: () => partsRequests,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  timeEntries: () => timeEntries,
  timeEntriesRelations: () => timeEntriesRelations,
  users: () => users,
  workers: () => workers,
  workersRelations: () => workersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  // فني، مساعد، مشرف، فني تحت الإشراف
  supervisor: varchar("supervisor", { length: 100 }),
  assistant: varchar("assistant", { length: 100 }),
  engineer: varchar("engineer", { length: 100 }),
  nationalId: varchar("national_id", { length: 20 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: varchar("address", { length: 255 }),
  isActive: boolean("is_active").default(true),
  isPredefined: boolean("is_predefined").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  taskNumber: varchar("task_number", { length: 20 }).unique().notNull(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  workerRole: varchar("worker_role", { length: 50 }).notNull().default("technician"),
  // assistant, technician, supervisor, engineer
  description: varchar("description", { length: 500 }).notNull(),
  carBrand: varchar("car_brand", { length: 50 }).notNull(),
  // audi, seat, skoda, volkswagen
  carModel: varchar("car_model", { length: 100 }).notNull(),
  licensePlate: varchar("license_plate", { length: 20 }).notNull(),
  estimatedDuration: integer("estimated_duration"),
  // in minutes
  engineerName: varchar("engineer_name", { length: 100 }),
  supervisorName: varchar("supervisor_name", { length: 100 }),
  technicianName: varchar("technician_name", { length: 100 }),
  assistantName: varchar("assistant_name", { length: 100 }),
  technicians: text("technicians").array(),
  // Array of technician names
  assistants: text("assistants").array(),
  // Array of assistant names
  repairOperation: varchar("repair_operation", { length: 200 }),
  taskType: varchar("task_type", { length: 20 }),
  // ميكانيك, كهربا
  color: varchar("color", { length: 20 }),
  // اللون
  timerType: varchar("timer_type", { length: 20 }).notNull().default("automatic"),
  // automatic, manual
  consumedTime: integer("consumed_time"),
  // in minutes - for manual timer
  status: varchar("status", { length: 20 }).notNull().default("active"),
  // active, paused, completed, archived
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  pausedAt: timestamp("paused_at"),
  pauseReason: varchar("pause_reason", { length: 100 }),
  pauseNotes: varchar("pause_notes", { length: 500 }),
  totalPausedDuration: integer("total_paused_duration").default(0),
  // in seconds
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: varchar("archived_by", { length: 100 }),
  archiveNotes: varchar("archive_notes", { length: 1e3 }),
  rating: integer("rating"),
  // 1-3 stars rating
  deliveryNumber: integer("delivery_number"),
  // Sequential number for delivered tasks
  isCancelled: boolean("is_cancelled").default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: varchar("cancelled_by", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow()
});
var timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  // in seconds
  entryType: varchar("entry_type", { length: 20 }).notNull(),
  // work, pause
  createdAt: timestamp("created_at").defaultNow()
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var customerCars = pgTable("customer_cars", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var workersRelations = relations(workers, ({ many }) => ({
  tasks: many(tasks)
}));
var tasksRelations = relations(tasks, ({ one, many }) => ({
  worker: one(workers, {
    fields: [tasks.workerId],
    references: [workers.id]
  }),
  timeEntries: many(timeEntries)
}));
var timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id]
  })
}));
var customersRelations = relations(customers, ({ many }) => ({
  cars: many(customerCars)
}));
var customerCarsRelations = relations(customerCars, ({ one }) => ({
  customer: one(customers, {
    fields: [customerCars.customerId],
    references: [customers.id]
  })
}));
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  permissions: text("permissions").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true
}).extend({
  nationalId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional()
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  taskNumber: true,
  createdAt: true,
  startTime: true
}).extend({
  carModel: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0645\u0648\u062F\u064A\u0644 \u0627\u0644\u0633\u064A\u0627\u0631\u0629"),
  licensePlate: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0644\u0648\u062D\u0629")
}).partial({
  assistantName: true,
  engineerName: true,
  supervisorName: true,
  technicianName: true,
  repairOperation: true,
  taskType: true,
  color: true,
  timerType: true
});
var insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
}).extend({
  name: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0632\u0628\u0648\u0646"),
  phoneNumber: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")
});
var insertCustomerCarSchema = createInsertSchema(customerCars).omit({
  id: true,
  createdAt: true
}).extend({
  carBrand: z.string().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0646\u0648\u0639 \u0627\u0644\u0633\u064A\u0627\u0631\u0629"),
  carModel: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0645\u0648\u062F\u064A\u0644 \u0627\u0644\u0633\u064A\u0627\u0631\u0629"),
  licensePlate: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0644\u0648\u062D\u0629")
}).partial({
  engineCode: true,
  chassisNumber: true
});
var partsRequests = pgTable("parts_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).unique(),
  engineerName: varchar("engineer_name", { length: 100 }).notNull(),
  carInfo: varchar("car_info", { length: 255 }).notNull(),
  // License plate, chassis number, or customer name
  carBrand: varchar("car_brand", { length: 50 }),
  carModel: varchar("car_model", { length: 100 }),
  licensePlate: varchar("license_plate", { length: 50 }),
  // رقم السيارة
  chassisNumber: varchar("chassis_number", { length: 100 }),
  // رقم الشاسيه
  engineCode: varchar("engine_code", { length: 50 }),
  // رمز المحرك
  reasonType: varchar("reason_type", { length: 50 }).notNull(),
  // "expense" or "loan"
  partName: varchar("part_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  // pending, approved, rejected, delivered
  notes: text("notes"),
  requestedBy: varchar("requested_by", { length: 100 }),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedBy: varchar("approved_by", { length: 100 }),
  approvedAt: timestamp("approved_at"),
  inPreparationAt: timestamp("in_preparation_at"),
  readyForPickupAt: timestamp("ready_for_pickup_at"),
  orderedExternallyAt: timestamp("ordered_externally_at"),
  orderedExternallyBy: varchar("ordered_externally_by", { length: 100 }),
  estimatedArrival: varchar("estimated_arrival", { length: 200 }),
  partsArrivedAt: timestamp("parts_arrived_at"),
  partsArrivedBy: varchar("parts_arrived_by", { length: 100 }),
  unavailableAt: timestamp("unavailable_at"),
  unavailableBy: varchar("unavailable_by", { length: 100 }),
  deliveredBy: varchar("delivered_by", { length: 100 }),
  deliveredAt: timestamp("delivered_at")
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPartsRequestSchema = createInsertSchema(partsRequests).omit({
  id: true,
  requestNumber: true,
  requestedAt: true,
  approvedAt: true,
  deliveredAt: true
}).extend({
  engineerName: z.string().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u0647\u0646\u062F\u0633"),
  carInfo: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0629"),
  reasonType: z.string().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0633\u0628\u0628 \u0627\u0644\u0637\u0644\u0628"),
  partName: z.string().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0642\u0637\u0639\u0629"),
  quantity: z.number().min(1, "\u064A\u062C\u0628 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0639\u062F\u062F")
}).partial({
  carBrand: true,
  carModel: true,
  licensePlate: true,
  chassisNumber: true,
  engineCode: true,
  notes: true,
  requestedBy: true,
  approvedBy: true,
  deliveredBy: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  } else {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 5e3
});
pool.on("error", (err) => {
  console.error("Database pool error:", err);
  if (process.env.NODE_ENV === "production") {
    console.log("Attempting to reconnect to database...");
  }
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, isNull, or, like, isNotNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getWorkers() {
    const workersData = await db.query.workers.findMany({
      with: {
        tasks: {
          where: eq(tasks.status, "active"),
          orderBy: [desc(tasks.createdAt)],
          limit: 1
        }
      }
    });
    return workersData.map((worker) => {
      const currentTask = worker.tasks[0] || void 0;
      const isAvailable = !currentTask;
      return {
        ...worker,
        tasks: worker.tasks,
        currentTask,
        totalWorkTime: 0,
        // TODO: Calculate from time entries
        isAvailable
      };
    });
  }
  async getWorker(id) {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker || void 0;
  }
  async getAllWorkerNames() {
    const predefinedNames = ["\u063A\u062F\u064A\u0631", "\u064A\u062D\u064A\u0649", "\u062D\u0633\u0627\u0645", "\u0645\u0635\u0637\u0641\u0649", "\u0632\u064A\u0627\u062F", "\u0633\u0644\u064A\u0645\u0627\u0646", "\u062D\u0633\u0646"];
    const allWorkers = await db.select({ name: workers.name }).from(workers).orderBy(workers.name);
    const allWorkerNames = allWorkers.map((w) => w.name);
    const uniqueNames = [...predefinedNames];
    allWorkerNames.forEach((name) => {
      if (!uniqueNames.includes(name)) {
        uniqueNames.push(name);
      }
    });
    return [...uniqueNames, "\u0639\u0627\u0645\u0644 \u062C\u062F\u064A\u062F"];
  }
  async createWorker(insertWorker) {
    const predefinedNames = ["\u063A\u062F\u064A\u0631", "\u064A\u062D\u064A\u0649", "\u062D\u0633\u0627\u0645", "\u0633\u0644\u064A\u0645\u0627\u0646", "\u0632\u064A\u0627\u062F", "\u062D\u0633\u0646"];
    const isPredefined = predefinedNames.includes(insertWorker.name);
    const [worker] = await db.insert(workers).values({
      ...insertWorker,
      isPredefined
    }).returning();
    return worker;
  }
  async updateWorker(id, updates) {
    const [worker] = await db.update(workers).set(updates).where(eq(workers.id, id)).returning();
    return worker;
  }
  async getTasks() {
    const tasksData = await db.query.tasks.findMany({
      with: {
        worker: true
      },
      orderBy: [desc(tasks.createdAt)]
    });
    return tasksData.map((task) => ({
      ...task,
      currentDuration: this.calculateCurrentDuration(task)
    }));
  }
  async getActiveTasks() {
    const tasksData = await db.query.tasks.findMany({
      where: and(
        eq(tasks.isArchived, false),
        or(
          eq(tasks.status, "active"),
          eq(tasks.status, "paused")
        )
      ),
      with: {
        worker: true
      },
      orderBy: [desc(tasks.startTime)]
    });
    return tasksData.map((task) => ({
      ...task,
      currentDuration: this.calculateCurrentDuration(task)
    }));
  }
  async getTask(id) {
    const taskData = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        worker: true
      }
    });
    if (!taskData) return void 0;
    return {
      ...taskData,
      currentDuration: this.calculateCurrentDuration(taskData)
    };
  }
  async createTask(insertTask) {
    if (!insertTask.workerId) {
      throw new Error("Worker ID is required");
    }
    const lastTask = await db.select({ taskNumber: tasks.taskNumber }).from(tasks).where(isNotNull(tasks.taskNumber)).orderBy(desc(tasks.id)).limit(1);
    let taskNumber = "1";
    if (lastTask.length > 0 && lastTask[0].taskNumber) {
      const lastNumber = parseInt(lastTask[0].taskNumber);
      if (!isNaN(lastNumber)) {
        taskNumber = String(lastNumber + 1);
      }
    }
    const [task] = await db.insert(tasks).values({
      workerId: insertTask.workerId,
      description: insertTask.description,
      carBrand: insertTask.carBrand,
      carModel: insertTask.carModel,
      licensePlate: insertTask.licensePlate,
      workerRole: insertTask.workerRole || "assistant",
      estimatedDuration: insertTask.estimatedDuration || null,
      engineerName: insertTask.engineerName || null,
      supervisorName: insertTask.supervisorName || null,
      technicianName: insertTask.technicianName || null,
      assistantName: insertTask.assistantName || null,
      technicians: insertTask.technicians || null,
      assistants: insertTask.assistants || null,
      repairOperation: insertTask.repairOperation || null,
      taskType: insertTask.taskType || null,
      color: insertTask.color || null,
      timerType: insertTask.timerType || "automatic",
      consumedTime: insertTask.timerType === "manual" ? insertTask.consumedTime || 0 : null,
      taskNumber,
      startTime: insertTask.timerType === "manual" ? null : /* @__PURE__ */ new Date(),
      status: insertTask.timerType === "manual" ? "completed" : "paused"
    }).returning();
    if (insertTask.timerType === "manual") {
      const consumedMinutes = insertTask.consumedTime || 0;
      const startTime = /* @__PURE__ */ new Date();
      const endTime = new Date(startTime.getTime() + consumedMinutes * 60 * 1e3);
      await db.insert(timeEntries).values({
        taskId: task.id,
        startTime,
        endTime,
        entryType: "work"
      });
      await db.update(tasks).set({
        status: "completed",
        endTime
      }).where(eq(tasks.id, task.id));
    }
    if (insertTask.timerType !== "manual") {
      await this.startTask(task.id);
    }
    return task;
  }
  async updateTask(id, updates) {
    const processedUpdates = { ...updates };
    if (updates.endTime && typeof updates.endTime === "string") {
      processedUpdates.endTime = new Date(updates.endTime);
    }
    if (updates.createdAt && typeof updates.createdAt === "string") {
      processedUpdates.createdAt = new Date(updates.createdAt);
    }
    const [task] = await db.update(tasks).set(processedUpdates).where(eq(tasks.id, id)).returning();
    return task;
  }
  async startTask(taskId) {
    await db.update(tasks).set({
      status: "active",
      pausedAt: null
    }).where(eq(tasks.id, taskId));
    const [timeEntry] = await db.insert(timeEntries).values({
      taskId,
      startTime: /* @__PURE__ */ new Date(),
      entryType: "work"
    }).returning();
    return timeEntry;
  }
  async pauseTask(taskId, reason, notes) {
    const now = /* @__PURE__ */ new Date();
    const [currentTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!currentTask) {
      throw new Error("Task not found");
    }
    let currentSessionTime = 0;
    const [currentEntry] = await db.select().from(timeEntries).where(
      and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime)
      )
    ).orderBy(desc(timeEntries.startTime)).limit(1);
    if (currentEntry) {
      currentSessionTime = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1e3);
      await db.update(timeEntries).set({
        endTime: now,
        duration: currentSessionTime
      }).where(eq(timeEntries.id, currentEntry.id));
    }
    const previousWorkTime = currentTask.totalPausedDuration || 0;
    const newAccumulatedTime = previousWorkTime + currentSessionTime;
    const [task] = await db.update(tasks).set({
      status: "paused",
      pausedAt: now,
      pauseReason: reason,
      pauseNotes: notes,
      totalPausedDuration: newAccumulatedTime
      // Store accumulated work time
    }).where(eq(tasks.id, taskId)).returning();
    return task;
  }
  async resumeTask(taskId) {
    return this.startTask(taskId);
  }
  async finishTask(taskId) {
    const now = /* @__PURE__ */ new Date();
    const [currentEntry] = await db.select().from(timeEntries).where(
      and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime)
      )
    ).orderBy(desc(timeEntries.startTime)).limit(1);
    if (currentEntry) {
      const duration = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1e3);
      await db.update(timeEntries).set({
        endTime: now,
        duration
      }).where(eq(timeEntries.id, currentEntry.id));
    }
    const [task] = await db.update(tasks).set({
      status: "completed",
      endTime: now
    }).where(eq(tasks.id, taskId)).returning();
    return task;
  }
  async getTaskHistory(limit = 50) {
    const tasksData = await db.query.tasks.findMany({
      where: eq(tasks.isArchived, false),
      with: {
        worker: true,
        timeEntries: true
      },
      orderBy: [desc(tasks.createdAt)],
      limit
    });
    return tasksData.map((task) => ({
      ...task,
      totalDuration: this.calculateCurrentDuration(task)
    }));
  }
  async archiveTask(taskId, archivedBy, notes, rating) {
    const now = /* @__PURE__ */ new Date();
    const lastArchivedTask = await db.query.tasks.findFirst({
      where: eq(tasks.isArchived, true),
      orderBy: [desc(tasks.deliveryNumber)]
    });
    const nextDeliveryNumber = (lastArchivedTask?.deliveryNumber || 0) + 1;
    const [task] = await db.update(tasks).set({
      isArchived: true,
      archivedAt: now,
      archivedBy,
      archiveNotes: notes,
      rating: rating || null,
      status: "archived",
      deliveryNumber: nextDeliveryNumber
    }).where(eq(tasks.id, taskId)).returning();
    return task;
  }
  async cancelTask(taskId, cancelledBy, reason) {
    const now = /* @__PURE__ */ new Date();
    const lastArchivedTask = await db.query.tasks.findFirst({
      where: eq(tasks.isArchived, true),
      orderBy: [desc(tasks.deliveryNumber)]
    });
    const nextDeliveryNumber = (lastArchivedTask?.deliveryNumber || 0) + 1;
    const [task] = await db.update(tasks).set({
      isArchived: true,
      isCancelled: true,
      cancelledAt: now,
      cancelledBy,
      cancellationReason: reason,
      archivedAt: now,
      archivedBy: cancelledBy,
      archiveNotes: `\u0645\u0647\u0645\u0629 \u0645\u0644\u063A\u0627\u0629 - \u0627\u0644\u0633\u0628\u0628: ${reason}`,
      status: "archived",
      deliveryNumber: nextDeliveryNumber
    }).where(eq(tasks.id, taskId)).returning();
    return task;
  }
  async getArchivedTasks(limit = 100) {
    const tasksData = await db.query.tasks.findMany({
      where: eq(tasks.isArchived, true),
      with: {
        worker: true,
        timeEntries: true
      },
      orderBy: [desc(tasks.archivedAt)],
      limit
    });
    return tasksData.map((task) => ({
      ...task,
      totalDuration: this.calculateCurrentDuration(task)
    }));
  }
  async searchArchive(searchTerm) {
    const tasksData = await db.query.tasks.findMany({
      where: and(
        eq(tasks.isArchived, true),
        or(
          like(tasks.description, `%${searchTerm}%`),
          like(tasks.carModel, `%${searchTerm}%`),
          like(tasks.licensePlate, `%${searchTerm}%`),
          like(tasks.archiveNotes, `%${searchTerm}%`)
        )
      ),
      with: {
        worker: true,
        timeEntries: true
      },
      orderBy: [desc(tasks.archivedAt)],
      limit: 50
    });
    return tasksData.map((task) => ({
      ...task,
      totalDuration: task.timeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0)
    }));
  }
  async getWorkerStats() {
    const allWorkers = await db.select().from(workers).where(eq(workers.isActive, true));
    const activeTasks = await db.select().from(tasks).where(eq(tasks.status, "active"));
    const totalWorkers = allWorkers.length;
    const busyWorkers = new Set(activeTasks.map((task) => task.workerId)).size;
    const availableWorkers = totalWorkers - busyWorkers;
    const activeTasksCount = activeTasks.length;
    return {
      totalWorkers,
      availableWorkers,
      busyWorkers,
      activeTasks: activeTasksCount
    };
  }
  calculateCurrentDuration(task) {
    if (task.timerType === "manual" && task.consumedTime) {
      return task.consumedTime * 60;
    }
    let startTime;
    let endTime;
    if (task.startTime) {
      startTime = new Date(task.startTime);
    } else if (task.createdAt) {
      startTime = new Date(task.createdAt);
    } else {
      return 0;
    }
    if (task.status === "completed" || task.status === "archived") {
      if (task.endTime) {
        endTime = new Date(task.endTime);
      } else {
        endTime = new Date(startTime.getTime() + 30 * 60 * 1e3);
      }
    } else if (task.status === "paused" && task.pausedAt) {
      endTime = new Date(task.pausedAt);
    } else if (task.status === "active") {
      endTime = /* @__PURE__ */ new Date();
    } else {
      endTime = /* @__PURE__ */ new Date();
    }
    const totalDurationMs = endTime.getTime() - startTime.getTime();
    const totalDuration = totalDurationMs / 1e3;
    const pausedTime = task.totalPausedDuration || 0;
    const calculatedDuration = Math.max(0, totalDuration - pausedTime);
    if ((task.status === "completed" || task.status === "archived") && calculatedDuration < 60) {
      return 60;
    }
    return calculatedDuration;
  }
  async getCarDataByLicensePlate(licensePlate) {
    const activeTask = await db.query.tasks.findFirst({
      where: eq(tasks.licensePlate, licensePlate),
      orderBy: [desc(tasks.createdAt)]
    });
    if (activeTask) {
      return {
        carBrand: activeTask.carBrand,
        carModel: activeTask.carModel,
        color: activeTask.color || void 0
      };
    }
    const archivedTask = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.licensePlate, licensePlate),
        eq(tasks.isArchived, true)
      ),
      orderBy: [desc(tasks.archivedAt)]
    });
    if (archivedTask) {
      return {
        carBrand: archivedTask.carBrand,
        carModel: archivedTask.carModel,
        color: archivedTask.color || void 0
      };
    }
    return null;
  }
  // Customer management methods
  async getCustomers() {
    return await db.query.customers.findMany({
      orderBy: [desc(customers.createdAt)]
    });
  }
  async getCustomer(id) {
    return await db.query.customers.findFirst({
      where: eq(customers.id, id)
    });
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, updates) {
    const [updatedCustomer] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return updatedCustomer;
  }
  async deleteCustomer(id) {
    await db.delete(customers).where(eq(customers.id, id));
  }
  // Customer cars management methods
  async getCustomerCars() {
    return await db.query.customerCars.findMany({
      orderBy: [desc(customerCars.createdAt)]
    });
  }
  async getCustomerCarsByCustomerId(customerId) {
    return await db.query.customerCars.findMany({
      where: eq(customerCars.customerId, customerId),
      orderBy: [desc(customerCars.createdAt)]
    });
  }
  async getCustomerCar(id) {
    return await db.query.customerCars.findFirst({
      where: eq(customerCars.id, id)
    });
  }
  async createCustomerCar(car) {
    const [newCar] = await db.insert(customerCars).values(car).returning();
    return newCar;
  }
  async updateCustomerCar(id, updates) {
    const [updatedCar] = await db.update(customerCars).set(updates).where(eq(customerCars.id, id)).returning();
    return updatedCar;
  }
  async deleteCustomerCar(id) {
    await db.delete(customerCars).where(eq(customerCars.id, id));
  }
  // User management methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(user) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async updateUser(id, updates) {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }
  // Parts requests management
  async getPartsRequests() {
    return await db.select().from(partsRequests).orderBy(desc(partsRequests.requestedAt));
  }
  async getPartsRequest(id) {
    const [request] = await db.select().from(partsRequests).where(eq(partsRequests.id, id));
    return request || void 0;
  }
  async createPartsRequest(request) {
    const existingRequests = await db.select().from(partsRequests);
    let maxNumber = 0;
    for (const req of existingRequests) {
      if (req.requestNumber && req.requestNumber.startsWith("\u0637\u0644\u0628-")) {
        const num = parseInt(req.requestNumber.substring(4));
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    const requestNumber = `\u0637\u0644\u0628-${maxNumber + 1}`;
    const [newRequest] = await db.insert(partsRequests).values({
      ...request,
      requestNumber,
      requestedAt: /* @__PURE__ */ new Date(),
      licensePlate: request.licensePlate || null,
      chassisNumber: request.chassisNumber || null,
      engineCode: request.engineCode || null
    }).returning();
    return newRequest;
  }
  async updatePartsRequestStatus(id, status, notes, estimatedArrival) {
    const updateData = { status };
    const now = /* @__PURE__ */ new Date();
    if (status === "approved") {
      updateData.approvedAt = now;
    } else if (status === "in_preparation") {
      updateData.inPreparationAt = now;
      updateData.approvedAt = now;
    } else if (status === "awaiting_pickup") {
      updateData.readyForPickupAt = now;
    } else if (status === "ordered_externally") {
      updateData.orderedExternallyAt = now;
      updateData.orderedExternallyBy = "\u0647\u0628\u0629";
      if (estimatedArrival) {
        updateData.estimatedArrival = estimatedArrival;
      }
    } else if (status === "parts_arrived") {
      updateData.partsArrivedAt = now;
      updateData.partsArrivedBy = "\u0628\u062F\u0648\u064A";
    } else if (status === "unavailable") {
      updateData.unavailableAt = now;
      updateData.unavailableBy = "\u0647\u0628\u0629";
    } else if (status === "delivered") {
      updateData.deliveredAt = now;
      updateData.deliveredBy = "\u0628\u062F\u0648\u064A";
    }
    if (notes) {
      updateData.notes = notes;
    }
    const [updated] = await db.update(partsRequests).set(updateData).where(eq(partsRequests.id, id)).returning();
    return updated;
  }
  async searchCarInfoForParts(searchTerm) {
    const [exactMatch] = await db.select({
      carBrand: customerCars.carBrand,
      carModel: customerCars.carModel,
      color: customerCars.color,
      licensePlate: customerCars.licensePlate,
      chassisNumber: customerCars.chassisNumber,
      engineCode: customerCars.engineCode
    }).from(customerCars).leftJoin(customers, eq(customerCars.customerId, customers.id)).where(eq(customerCars.licensePlate, searchTerm)).limit(1);
    if (exactMatch) {
      return {
        carBrand: exactMatch.carBrand,
        carModel: exactMatch.carModel,
        color: exactMatch.color || void 0,
        licensePlate: exactMatch.licensePlate || void 0,
        chassisNumber: exactMatch.chassisNumber || void 0,
        engineCode: exactMatch.engineCode || void 0
      };
    }
    const [partialMatch] = await db.select({
      carBrand: customerCars.carBrand,
      carModel: customerCars.carModel,
      color: customerCars.color,
      licensePlate: customerCars.licensePlate,
      chassisNumber: customerCars.chassisNumber,
      engineCode: customerCars.engineCode
    }).from(customerCars).leftJoin(customers, eq(customerCars.customerId, customers.id)).where(
      or(
        like(customerCars.licensePlate, `%${searchTerm}%`),
        like(customerCars.chassisNumber, `%${searchTerm}%`),
        like(customers.name, `%${searchTerm}%`)
      )
    ).limit(1);
    return partialMatch ? {
      carBrand: partialMatch.carBrand,
      carModel: partialMatch.carModel,
      color: partialMatch.color || void 0,
      licensePlate: partialMatch.licensePlate || void 0,
      chassisNumber: partialMatch.chassisNumber || void 0,
      engineCode: partialMatch.engineCode || void 0
    } : null;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "v-power-tuning-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        console.error("\u{1F6A8} Authentication error:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  initializeDefaultUsers();
}
async function initializeDefaultUsers() {
  try {
    const existingFinanceUser = await storage.getUserByUsername("\u0645\u0644\u0643");
    if (!existingFinanceUser) {
      await storage.createUser({
        username: "\u0645\u0644\u0643",
        password: await hashPassword("12345"),
        role: "finance",
        permissions: [
          "dashboard:read",
          "tasks:read",
          "archive:read",
          "customers:read"
        ]
      });
      console.log("\u2713 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0627\u0644\u064A\u0629: \u0645\u0644\u0643");
    }
    const existingOperatorUser = await storage.getUserByUsername("\u0628\u062F\u0648\u064A");
    if (!existingOperatorUser) {
      await storage.createUser({
        username: "\u0628\u062F\u0648\u064A",
        password: await hashPassword("0000"),
        role: "operator",
        permissions: [
          "dashboard:read",
          "timers:read",
          "timers:write",
          "tasks:read",
          "tasks:write",
          "archive:read",
          "customers:read",
          "customers:write",
          "parts:read",
          "parts:create"
        ]
      });
      console.log("\u2713 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A: \u0628\u062F\u0648\u064A");
    }
    const existingViewerUser = await storage.getUserByUsername("\u0647\u0628\u0629");
    if (!existingViewerUser) {
      await storage.createUser({
        username: "\u0647\u0628\u0629",
        password: await hashPassword("123456"),
        role: "viewer",
        permissions: [
          "dashboard:read",
          "timers:read",
          "tasks:read",
          "customers:read",
          "parts:read",
          "parts:approve",
          "parts:reject"
        ]
      });
      console.log("\u2713 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0629: \u0647\u0628\u0629");
    }
    const existingSupervisorUser = await storage.getUserByUsername("\u0631\u0648\u0627\u0646");
    if (!existingSupervisorUser) {
      await storage.createUser({
        username: "\u0631\u0648\u0627\u0646",
        password: await hashPassword("1234567"),
        role: "supervisor",
        permissions: [
          "dashboard:read",
          "timers:read",
          "tasks:read",
          "tasks:create",
          "archive:read",
          "customers:read"
        ]
      });
      console.log("\u2713 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0634\u0631\u0641: \u0631\u0648\u0627\u0646");
    }
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u064A\u0646:", error);
  }
}

// server/routes.ts
var wss;
var clients = /* @__PURE__ */ new Set();
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/workers", async (req, res) => {
    try {
      const workers2 = await storage.getWorkers();
      res.json(workers2);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ message: "Failed to fetch workers" });
    }
  });
  app2.get("/api/workers/names", async (req, res) => {
    try {
      const workers2 = await storage.getAllWorkerNames();
      res.json(workers2);
    } catch (error) {
      console.error("Error fetching worker names:", error);
      res.status(500).json({ message: "Failed to fetch worker names" });
    }
  });
  app2.post("/api/workers", async (req, res) => {
    try {
      const workerData = insertWorkerSchema.parse(req.body);
      const worker = await storage.createWorker(workerData);
      broadcastUpdate("worker_created", worker);
      res.json(worker);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid worker data", errors: error.errors });
      } else {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Failed to create worker" });
      }
    }
  });
  app2.get("/api/tasks", async (req, res) => {
    try {
      const tasks2 = await storage.getTasks();
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/tasks/active", async (req, res) => {
    try {
      const activeTasks = await storage.getActiveTasks();
      res.json(activeTasks);
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      res.status(500).json({ message: "Failed to fetch active tasks" });
    }
  });
  app2.post("/api/tasks", async (req, res) => {
    try {
      const { taskNumber, ...requestData } = req.body;
      const taskData = insertTaskSchema.parse(requestData);
      const task = await storage.createTask(taskData);
      broadcastUpdate("task_created", task);
      res.json(task);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  app2.post("/api/tasks/:id/pause", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.pauseTask(taskId);
      broadcastUpdate("task_paused", task);
      res.json(task);
    } catch (error) {
      console.error("Error pausing task:", error);
      res.status(500).json({ message: "Failed to pause task" });
    }
  });
  app2.post("/api/tasks/:id/resume", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const timeEntry = await storage.resumeTask(taskId);
      broadcastUpdate("task_resumed", { taskId, timeEntry });
      res.json(timeEntry);
    } catch (error) {
      console.error("Error resuming task:", error);
      res.status(500).json({ message: "Failed to resume task" });
    }
  });
  app2.post("/api/tasks/:id/finish", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.finishTask(taskId);
      broadcastUpdate("task_finished", task);
      res.json(task);
    } catch (error) {
      console.error("Error finishing task:", error);
      res.status(500).json({ message: "Failed to finish task" });
    }
  });
  app2.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      console.log(`Updating task ${id} with data:`, updates);
      if (updates.description !== void 0 && typeof updates.description !== "string") {
        return res.status(400).json({ error: "\u0648\u0635\u0641 \u0627\u0644\u0645\u0647\u0645\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0646\u0635" });
      }
      if (updates.estimatedDuration !== void 0 && (typeof updates.estimatedDuration !== "number" || updates.estimatedDuration <= 0)) {
        return res.status(400).json({ error: "\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0642\u062F\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645 \u0645\u0648\u062C\u0628" });
      }
      const task = await storage.updateTask(id, updates);
      console.log("Task updated successfully:", task);
      broadcastUpdate("task_updated", task);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message || "\u0641\u0634\u0644 \u0641\u064A \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0647\u0645\u0629" });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWorkerStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/tasks/history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const history = await storage.getTaskHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });
  app2.post("/api/tasks/:id/archive", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { archivedBy, notes, rating } = req.body;
      if (!archivedBy) {
        return res.status(400).json({ message: "archivedBy is required" });
      }
      const task = await storage.archiveTask(taskId, archivedBy, notes, rating);
      broadcastUpdate("task_archived", task);
      res.json(task);
    } catch (error) {
      console.error("Error archiving task:", error);
      res.status(500).json({ message: "Failed to archive task" });
    }
  });
  app2.post("/api/tasks/:id/cancel", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { cancelledBy, reason } = req.body;
      if (!cancelledBy || !reason) {
        return res.status(400).json({ message: "cancelledBy and reason are required" });
      }
      const task = await storage.cancelTask(taskId, cancelledBy, reason);
      broadcastUpdate("task_cancelled", task);
      res.json(task);
    } catch (error) {
      console.error("Error cancelling task:", error);
      res.status(500).json({ message: "Failed to cancel task" });
    }
  });
  app2.get("/api/archive", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const archive = await storage.getArchivedTasks(limit);
      res.json(archive);
    } catch (error) {
      console.error("Error fetching archive:", error);
      res.status(500).json({ message: "Failed to fetch archive" });
    }
  });
  app2.get("/api/archive/search", async (req, res) => {
    try {
      const searchTerm = req.query.q;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const results = await storage.searchArchive(searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Error searching archive:", error);
      res.status(500).json({ message: "Failed to search archive" });
    }
  });
  app2.get("/api/cars/:licensePlate", async (req, res) => {
    try {
      const licensePlate = req.params.licensePlate;
      const carData = await storage.getCarDataByLicensePlate(licensePlate);
      if (!carData) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(carData);
    } catch (error) {
      console.error("Error fetching car data:", error);
      res.status(500).json({ message: "Failed to fetch car data" });
    }
  });
  app2.get("/api/customers", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  app2.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      broadcastUpdate("customer_created", customer);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid customer data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  app2.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updates);
      broadcastUpdate("customer_updated", customer);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid customer data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  app2.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      broadcastUpdate("customer_deleted", { id });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  app2.get("/api/customer-cars", async (req, res) => {
    try {
      const cars = await storage.getCustomerCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching customer cars:", error);
      res.status(500).json({ message: "Failed to fetch customer cars" });
    }
  });
  app2.get("/api/customer-cars/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const cars = await storage.getCustomerCarsByCustomerId(customerId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching customer cars:", error);
      res.status(500).json({ message: "Failed to fetch customer cars" });
    }
  });
  app2.get("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCustomerCar(id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });
  app2.post("/api/customer-cars", async (req, res) => {
    try {
      const carData = insertCustomerCarSchema.parse(req.body);
      const car = await storage.createCustomerCar(carData);
      broadcastUpdate("customer_car_created", car);
      res.status(201).json(car);
    } catch (error) {
      console.error("Error creating customer car:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid car data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create customer car" });
    }
  });
  app2.put("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCustomerCarSchema.partial().parse(req.body);
      const car = await storage.updateCustomerCar(id, updates);
      broadcastUpdate("customer_car_updated", car);
      res.json(car);
    } catch (error) {
      console.error("Error updating customer car:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid car data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update customer car" });
    }
  });
  app2.delete("/api/customer-cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomerCar(id);
      broadcastUpdate("customer_car_deleted", { id });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer car:", error);
      res.status(500).json({ message: "Failed to delete customer car" });
    }
  });
  app2.get("/api/car-search", async (req, res) => {
    try {
      const searchTerm = req.query.q;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const carData = await storage.searchCarInfoForParts(searchTerm);
      if (!carData) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(carData);
    } catch (error) {
      console.error("Error searching for car:", error);
      res.status(500).json({ message: "Failed to search for car" });
    }
  });
  app2.get("/api/parts-requests", async (req, res) => {
    try {
      const requests = await storage.getPartsRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching parts requests:", error);
      res.status(500).json({ message: "Failed to fetch parts requests" });
    }
  });
  app2.get("/api/parts-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getPartsRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Parts request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching parts request:", error);
      res.status(500).json({ message: "Failed to fetch parts request" });
    }
  });
  app2.post("/api/parts-requests", async (req, res) => {
    try {
      console.log("\u{1F4E6} Received parts request data:", JSON.stringify(req.body, null, 2));
      const requestData = insertPartsRequestSchema.parse(req.body);
      console.log("\u2705 Parsed request data:", JSON.stringify(requestData, null, 2));
      const request = await storage.createPartsRequest(requestData);
      console.log("\u{1F4CB} Created request:", JSON.stringify(request, null, 2));
      if (request.engineerName && request.partName) {
        const eventData = {
          id: request.id,
          engineer: request.engineerName,
          partName: request.partName,
          requestNumber: request.requestNumber
        };
        broadcastUpdate("parts_request_created", request);
        console.log("\u{1F514} Broadcasting parts request notification:", JSON.stringify(eventData, null, 2));
      }
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating parts request:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create parts request" });
    }
  });
  app2.patch("/api/parts-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes, estimatedArrival } = req.body;
      const request = await storage.updatePartsRequestStatus(id, status, notes, estimatedArrival);
      if (status === "delivered") {
        broadcastUpdate("parts_request_delivered", request);
      }
      broadcastUpdate("parts_request_updated", request);
      res.json(request);
    } catch (error) {
      console.error("Error updating parts request status:", error);
      res.status(500).json({ message: "Failed to update parts request status" });
    }
  });
  app2.get("/api/search-car-info", async (req, res) => {
    try {
      const { term } = req.query;
      if (!term) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const carInfo = await storage.searchCarInfoForParts(term);
      res.json(carInfo);
    } catch (error) {
      console.error("Error searching car info:", error);
      res.status(500).json({ message: "Failed to search car info" });
    }
  });
  const httpServer = createServer(app2);
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    ws2.isAlive = true;
    clients.add(ws2);
    ws2.on("pong", () => {
      ws2.isAlive = true;
    });
    ws2.on("close", () => {
      clients.delete(ws2);
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws2);
    });
    sendInitialData(ws2);
  });
  setInterval(() => {
    clients.forEach((ws2) => {
      if (!ws2.isAlive) {
        clients.delete(ws2);
        return ws2.terminate();
      }
      ws2.isAlive = false;
      ws2.ping();
    });
  }, 3e4);
  setInterval(() => {
    broadcastUpdate("timer_tick", { timestamp: Date.now() });
  }, 100);
  return httpServer;
}
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
async function sendInitialData(ws2) {
  try {
    const [workers2, activeTasks, stats] = await Promise.all([
      storage.getWorkers(),
      storage.getActiveTasks(),
      storage.getWorkerStats()
    ]);
    if (ws2.readyState === WebSocket.OPEN) {
      ws2.send(JSON.stringify({
        type: "initial_data",
        data: {
          workers: workers2,
          activeTasks,
          stats
        }
      }));
    }
  } catch (error) {
    console.error("Error sending initial data:", error);
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
process.on("SIGTERM", () => {
  log("\u{1F504} SIGTERM received, shutting down gracefully...");
  process.exit(0);
});
process.on("SIGINT", () => {
  log("\u{1F504} SIGINT received, shutting down gracefully...");
  process.exit(0);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (process.env.NODE_ENV === "production") {
    setTimeout(() => process.exit(1), 1e3);
  } else {
    process.exit(1);
  }
});
var app = express2();
app.set("trust proxy", 1);
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Accept-Charset", "utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "false");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
});
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/ready", (_req, res) => {
  res.status(200).json({
    status: "ready",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isProduction = true;
  if (isProduction) {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5e3;
  const host = "0.0.0.0";
  console.log(`\u{1F310} Deployment mode: production (forced for external access)`);
  console.log(`\u{1F527} Server binding to: ${host}:${port}`);
  server.listen(port, host, () => {
    log(`\u{1F680} V POWER TUNING Server \u062C\u0627\u0647\u0632!`);
    log(`   - Environment: ${process.env.NODE_ENV || "development"}`);
    log(`   - Port: ${port}`);
    log(`   - Host: ${host}`);
    if (process.env.NODE_ENV !== "production") {
      log(`   - \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632: http://localhost:${port}`);
      log(`   - \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632 \u0623\u064A\u0636\u0627\u064B: http://127.0.0.1:${port}`);
      log(`   - \u0645\u0646 \u0623\u062C\u0647\u0632\u0629 \u0623\u062E\u0631\u0649: http://[\u0639\u0646\u0648\u0627\u0646-IP]:${port}`);
      log(`\u{1F4F1} \u0644\u0645\u0639\u0631\u0641\u0629 \u0639\u0646\u0648\u0627\u0646 IP: \u0627\u0643\u062A\u0628 ipconfig \u0641\u064A cmd`);
      log(`\u{1F527} \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u0634\u0628\u0643\u0629 (0.0.0.0)`);
      log(`\u{1F4A1} \u0625\u0630\u0627 \u0644\u0645 \u064A\u0639\u0645\u0644 localhost \u062C\u0631\u0628: 127.0.0.1:${port}`);
      log(`\u{1F4D6} \u0631\u0627\u062C\u0639 \u0645\u0644\u0641 '\u062A\u062C\u0631\u0628\u0629-\u0627\u0644\u0627\u062A\u0635\u0627\u0644.md' \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629`);
      log(`\u{1F525} \u062C\u0631\u0628 \u0645\u0646 \u062C\u0647\u0627\u0632 \u0622\u062E\u0631: http://[IP]:${port}`);
      log(`\u{1F6A8} \u062A\u0623\u0643\u062F \u0645\u0646 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0641\u0627\u064A\u0631\u0648\u0648\u0644 \u0623\u0648 \u0627\u0644\u0633\u0645\u0627\u062D \u0644\u0644\u0628\u0648\u0631\u062A ${port}`);
    }
  }).on("error", (err) => {
    console.error(`\u274C Server startup error:`, err);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use`);
    }
    if (process.env.NODE_ENV === "production") {
      setTimeout(() => process.exit(1), 1e3);
    } else {
      process.exit(1);
    }
  });
})();
