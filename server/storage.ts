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
  archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task>;
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
    const predefinedNames = ["غدير", "يحيى", "حسام", "مصطفى", "زياد", "سليمان", "علي", "حسن"];
    
    // Get all worker names from database (both predefined and custom)
    const allWorkers = await db
      .select({ name: workers.name })
      .from(workers)
      .orderBy(workers.name);
    
    const allWorkerNames = allWorkers.map(w => w.name);
    
    // Combine all names and remove duplicates, keep predefined order first
    const uniqueNames = [...predefinedNames];
    allWorkerNames.forEach(name => {
      if (!uniqueNames.includes(name)) {
        uniqueNames.push(name);
      }
    });
    
    return [...uniqueNames, "عامل جديد"];
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const predefinedNames = ["غدير", "يحيى", "حسام", "سليمان", "علي", "زياد", "حسن"];
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
      where: and(
        eq(tasks.isArchived, false),
        or(
          eq(tasks.status, "active"),
          eq(tasks.status, "paused")
        )
      ),
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

  async pauseTask(taskId: number, reason?: string, notes?: string): Promise<Task> {
    const now = new Date();
    
    // Get current task to calculate accumulated work time
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!currentTask) {
      throw new Error("Task not found");
    }

    // Calculate current session work time
    let currentSessionTime = 0;
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
      currentSessionTime = Math.floor((now.getTime() - currentEntry.startTime.getTime()) / 1000);
      
      // End current time entry
      await db
        .update(timeEntries)
        .set({
          endTime: now,
          duration: currentSessionTime,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }

    // Calculate total accumulated work time
    const previousWorkTime = currentTask.totalPausedDuration || 0;
    const newAccumulatedTime = previousWorkTime + currentSessionTime;

    // Update task status and store accumulated work time
    const [task] = await db
      .update(tasks)
      .set({
        status: "paused",
        pausedAt: now,
        pauseReason: reason,
        pauseNotes: notes,
        totalPausedDuration: newAccumulatedTime, // Store accumulated work time
      })
      .where(eq(tasks.id, taskId))
      .returning();

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

  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const now = new Date();
    
    const [task] = await db
      .update(tasks)
      .set({
        isArchived: true,
        archivedAt: now,
        archivedBy,
        archiveNotes: notes,
        rating: rating || null,
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
      totalDuration: this.calculateCurrentDuration(task),
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
    
    const startTime = new Date(task.startTime);
    let endTime: Date;
    
    // For completed/archived tasks, use the end time
    if (task.endTime) {
      endTime = new Date(task.endTime);
    }
    // For paused tasks, calculate up to pause time
    else if (task.status === 'paused' && task.pausedAt) {
      endTime = new Date(task.pausedAt);
    }
    // For active tasks, use current time
    else {
      endTime = new Date();
    }
    
    const totalDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const pausedTime = task.totalPausedDuration || 0;
    
    return Math.max(0, totalDuration - pausedTime);
  }
}

export const storage = new DatabaseStorage();
