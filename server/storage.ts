import { workers, tasks, timeEntries, type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, or, like } from "drizzle-orm";

export interface IStorage {
  // Worker management
  getWorkers(): Promise<WorkerWithTasks[]>;
  getAllWorkerNames(): Promise<string[]>;
  getWorker(id: number): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker>;
  
  // Task management
  getTasks(): Promise<TaskWithWorker[]>;
  getActiveTasks(): Promise<TaskWithWorker[]>;
  getTask(id: number): Promise<TaskWithWorker | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  
  // Time tracking
  startTask(taskId: number): Promise<TimeEntry>;
  pauseTask(taskId: number): Promise<Task>;
  resumeTask(taskId: number): Promise<TimeEntry>;
  finishTask(taskId: number): Promise<Task>;
  
  // Archive management
  archiveTask(taskId: number, archivedBy: string, notes?: string): Promise<Task>;
  getArchivedTasks(limit?: number): Promise<TaskHistory[]>;
  searchArchive(searchTerm: string): Promise<TaskHistory[]>;
  
  // History and reporting  
  getTaskHistory(limit?: number): Promise<TaskHistory[]>;
  getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }>;
}

export class DatabaseStorage implements IStorage {
  async getWorkers(): Promise<WorkerWithTasks[]> {
    const workersData = await db.query.workers.findMany({
      with: {
        tasks: {
          where: eq(tasks.status, "active"),
          orderBy: [desc(tasks.createdAt)],
          limit: 1,
        },
      },
    });

    return workersData.map(worker => {
      const currentTask = worker.tasks[0] || undefined;
      const isAvailable = !currentTask;
      
      return {
        ...worker,
        tasks: worker.tasks,
        currentTask,
        totalWorkTime: 0, // TODO: Calculate from time entries
        isAvailable,
      };
    });
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker || undefined;
  }

  async getAllWorkerNames(): Promise<string[]> {
    const predefinedNames = ["مصطفى", "حسام", "زياد", "حسن", "يحيى", "محمد العلي", "سليمان", "علي"];
    
    // Get custom worker names from database
    const customWorkers = await db
      .select({ name: workers.name })
      .from(workers)
      .where(eq(workers.isPredefined, false));
    
    const customNames = customWorkers.map(w => w.name);
    
    // Combine predefined and custom names, then add "عامل جديد"
    return [...predefinedNames, ...customNames, "عامل جديد"];
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const predefinedNames = ["مصطفى", "حسام", "زياد", "حسن", "يحيى", "محمد العلي", "سليمان", "علي"];
    const isPredefined = predefinedNames.includes(insertWorker.name);
    
    const [worker] = await db
      .insert(workers)
      .values({
        ...insertWorker,
        isPredefined
      })
      .returning();
    return worker;
  }

  async updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker> {
    const [worker] = await db
      .update(workers)
      .set(updates)
      .where(eq(workers.id, id))
      .returning();
    return worker;
  }

  async getTasks(): Promise<TaskWithWorker[]> {
    const tasksData = await db.query.tasks.findMany({
      with: {
        worker: true,
      },
      orderBy: [desc(tasks.createdAt)],
    });

    return tasksData.map(task => ({
      ...task,
      currentDuration: this.calculateCurrentDuration(task),
    }));
  }

  async getActiveTasks(): Promise<TaskWithWorker[]> {
    const tasksData = await db.query.tasks.findMany({
      where: eq(tasks.status, "active"),
      with: {
        worker: true,
      },
      orderBy: [desc(tasks.startTime)],
    });

    return tasksData.map(task => ({
      ...task,
      currentDuration: this.calculateCurrentDuration(task),
    }));
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    const taskData = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        worker: true,
      },
    });

    if (!taskData) return undefined;

    return {
      ...taskData,
      currentDuration: this.calculateCurrentDuration(taskData),
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        startTime: new Date(),
        status: "active",
      })
      .returning();

    // Create initial time entry
    await db.insert(timeEntries).values({
      taskId: task.id,
      startTime: task.startTime!,
      entryType: "work",
    });

    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async startTask(taskId: number): Promise<TimeEntry> {
    // Resume task if paused
    await db
      .update(tasks)
      .set({
        status: "active",
        pausedAt: null,
      })
      .where(eq(tasks.id, taskId));

    const [timeEntry] = await db
      .insert(timeEntries)
      .values({
        taskId,
        startTime: new Date(),
        entryType: "work",
      })
      .returning();

    return timeEntry;
  }

  async pauseTask(taskId: number): Promise<Task> {
    const now = new Date();
    
    // Update task status
    const [task] = await db
      .update(tasks)
      .set({
        status: "paused",
        pausedAt: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // End current time entry
    const [currentEntry] = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.taskId, taskId),
          isNull(timeEntries.endTime)
        )
      )
      .orderBy(desc(timeEntries.startTime))
      .limit(1);

    if (currentEntry) {
      const duration = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: now,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }

    return task;
  }

  async resumeTask(taskId: number): Promise<TimeEntry> {
    return this.startTask(taskId);
  }

  async finishTask(taskId: number): Promise<Task> {
    const now = new Date();
    
    // End current time entry if exists
    const [currentEntry] = await db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.taskId, taskId),
          isNull(timeEntries.endTime)
        )
      )
      .orderBy(desc(timeEntries.startTime))
      .limit(1);

    if (currentEntry) {
      const duration = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: now,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }

    // Update task status
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        endTime: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
  }

  async getTaskHistory(limit: number = 50): Promise<TaskHistory[]> {
    const tasksData = await db.query.tasks.findMany({
      where: eq(tasks.isArchived, false),
      with: {
        worker: true,
        timeEntries: true,
      },
      orderBy: [desc(tasks.createdAt)],
      limit,
    });

    return tasksData.map(task => ({
      ...task,
      totalDuration: task.timeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0),
    }));
  }

  async archiveTask(taskId: number, archivedBy: string, notes?: string): Promise<Task> {
    const now = new Date();
    
    const [task] = await db
      .update(tasks)
      .set({
        isArchived: true,
        archivedAt: now,
        archivedBy,
        archiveNotes: notes,
        status: "archived",
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
  }

  async getArchivedTasks(limit: number = 100): Promise<TaskHistory[]> {
    const tasksData = await db.query.tasks.findMany({
      where: eq(tasks.isArchived, true),
      with: {
        worker: true,
        timeEntries: true,
      },
      orderBy: [desc(tasks.archivedAt)],
      limit,
    });

    return tasksData.map(task => ({
      ...task,
      totalDuration: task.timeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0),
    }));
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
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
        timeEntries: true,
      },
      orderBy: [desc(tasks.archivedAt)],
      limit: 50,
    });

    return tasksData.map(task => ({
      ...task,
      totalDuration: task.timeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0),
    }));
  }

  async getWorkerStats() {
    const allWorkers = await db.select().from(workers).where(eq(workers.isActive, true));
    const activeTasks = await db.select().from(tasks).where(eq(tasks.status, "active"));
    
    const totalWorkers = allWorkers.length;
    const busyWorkers = new Set(activeTasks.map(task => task.workerId)).size;
    const availableWorkers = totalWorkers - busyWorkers;
    const activeTasksCount = activeTasks.length;

    return {
      totalWorkers,
      availableWorkers,
      busyWorkers,
      activeTasks: activeTasksCount,
    };
  }

  private calculateCurrentDuration(task: Task): number {
    if (!task.startTime) return 0;
    
    const now = new Date();
    const startTime = new Date(task.startTime);
    const totalTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    // Subtract paused duration
    const pausedDuration = task.totalPausedDuration || 0;
    
    return Math.max(0, totalTime - pausedDuration);
  }
}

export const storage = new DatabaseStorage();
