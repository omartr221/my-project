import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull().default("technician"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskNumber: text("task_number"),
  workerId: integer("worker_id").notNull(),
  workerRole: text("worker_role").default("technician"),
  description: text("description").notNull(),
  repairOperation: text("repair_operation"),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  licensePlate: text("license_plate"),
  estimatedDuration: integer("estimated_duration"),
  status: text("status").notNull().default("pending"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  pauseReason: text("pause_reason"),
  pauseNotes: text("pause_notes"),
  engineerName: text("engineer_name"),
  supervisorName: text("supervisor_name"),
  assistantName: text("assistant_name"),
  archivedAt: text("archived_at"),
  archivedBy: text("archived_by"),
  archiveNotes: text("archive_notes"),
  rating: integer("rating"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  duration: integer("duration").default(0),
  entryType: text("entry_type").default("work"),
  notes: text("notes"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

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

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

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