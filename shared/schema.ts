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
  assistantName: varchar("assistant_name", { length: 100 }),
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
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

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
