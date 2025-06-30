import { db } from './db-sqlite';
import { workers, tasks, timeEntries } from '@shared/schema-sqlite';
import { eq, desc, and, sql, isNull, or, like } from 'drizzle-orm';
import type { 
  Worker, 
  InsertWorker, 
  Task, 
  InsertTask, 
  TimeEntry, 
  InsertTimeEntry,
  WorkerWithTasks,
  TaskWithWorker,
  TaskHistory
} from '@shared/schema-sqlite';

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
  pauseTask(taskId: number, reason?: string, notes?: string): Promise<Task>;
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

export class SQLiteStorage implements IStorage {
  async getWorkers(): Promise<WorkerWithTasks[]> {
    const allWorkers = await db.select().from(workers);
    const allTasks = await db.select().from(tasks);
    
    return allWorkers.map(worker => {
      const workerTasks = allTasks.filter(task => task.workerId === worker.id);
      const currentTask = workerTasks.find(task => task.status === 'active');
      const totalWorkTime = workerTasks.reduce((total, task) => {
        return total + this.calculateCurrentDuration(task);
      }, 0);
      
      return {
        ...worker,
        tasks: workerTasks,
        currentTask,
        totalWorkTime,
        isAvailable: !currentTask,
      };
    });
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const result = await db.select().from(workers).where(eq(workers.id, id));
    return result[0] || undefined;
  }

  async getAllWorkerNames(): Promise<string[]> {
    const result = await db.select({ name: workers.name }).from(workers);
    return result.map(w => w.name);
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const result = await db.insert(workers).values(insertWorker).returning();
    return result[0];
  }

  async updateWorker(id: number, updates: Partial<InsertWorker>): Promise<Worker> {
    const result = await db.update(workers)
      .set(updates)
      .where(eq(workers.id, id))
      .returning();
    return result[0];
  }

  async getTasks(): Promise<TaskWithWorker[]> {
    const tasksWithWorkers = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .orderBy(desc(tasks.createdAt));

    return tasksWithWorkers.map(row => ({
      ...row.tasks,
      worker: row.workers!,
      currentDuration: this.calculateCurrentDuration(row.tasks),
    }));
  }

  async getActiveTasks(): Promise<TaskWithWorker[]> {
    const activeTasks = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.status, 'active'))
      .orderBy(desc(tasks.createdAt));

    return activeTasks.map(row => ({
      ...row.tasks,
      worker: row.workers!,
      currentDuration: this.calculateCurrentDuration(row.tasks),
    }));
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    const result = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.id, id));

    if (!result[0]) return undefined;

    return {
      ...result[0].tasks,
      worker: result[0].workers!,
      currentDuration: this.calculateCurrentDuration(result[0].tasks),
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const taskNumber = `2025-${String(Date.now()).slice(-6)}`;
    const result = await db.insert(tasks).values({
      ...insertTask,
      taskNumber,
    }).returning();
    return result[0];
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const result = await db.update(tasks)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async startTask(taskId: number): Promise<TimeEntry> {
    const now = new Date().toISOString();
    
    // Update task status and start time
    await db.update(tasks)
      .set({
        status: 'active',
        startTime: now,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    // Create time entry
    const timeEntry = await db.insert(timeEntries).values({
      taskId,
      startTime: now,
      entryType: 'work',
    }).returning();

    return timeEntry[0];
  }

  async pauseTask(taskId: number, reason?: string, notes?: string): Promise<Task> {
    const now = new Date().toISOString();
    
    // End current time entry
    await db.update(timeEntries)
      .set({
        endTime: now,
        duration: sql`CAST((julianday(${now}) - julianday(start_time)) * 86400 AS INTEGER)`,
      })
      .where(and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime)
      ));

    // Update task status
    const result = await db.update(tasks)
      .set({
        status: 'paused',
        pauseReason: reason,
        pauseNotes: notes,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  async resumeTask(taskId: number): Promise<TimeEntry> {
    const now = new Date().toISOString();
    
    // Update task status
    await db.update(tasks)
      .set({
        status: 'active',
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    // Create new time entry
    const timeEntry = await db.insert(timeEntries).values({
      taskId,
      startTime: now,
      entryType: 'work',
    }).returning();

    return timeEntry[0];
  }

  async finishTask(taskId: number): Promise<Task> {
    const now = new Date().toISOString();
    
    // End current time entry
    await db.update(timeEntries)
      .set({
        endTime: now,
        duration: sql`CAST((julianday(${now}) - julianday(start_time)) * 86400 AS INTEGER)`,
      })
      .where(and(
        eq(timeEntries.taskId, taskId),
        isNull(timeEntries.endTime)
      ));

    // Update task status
    const result = await db.update(tasks)
      .set({
        status: 'completed',
        endTime: now,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  async getTaskHistory(limit: number = 50): Promise<TaskHistory[]> {
    const completedTasks = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.status, 'completed'))
      .orderBy(desc(tasks.endTime))
      .limit(limit);

    const result: TaskHistory[] = [];
    
    for (const row of completedTasks) {
      const taskTimeEntries = await db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.taskId, row.tasks.id));

      const totalDuration = taskTimeEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);

      result.push({
        ...row.tasks,
        worker: row.workers!,
        totalDuration,
      });
    }

    return result;
  }

  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const now = new Date().toISOString();
    
    // Finish task if not already finished
    const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (taskResult[0] && taskResult[0].status !== 'completed') {
      await this.finishTask(taskId);
    }

    // Archive the task
    const result = await db.update(tasks)
      .set({
        status: 'archived',
        archivedAt: now,
        archivedBy,
        archiveNotes: notes,
        rating,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  }

  async getArchivedTasks(limit: number = 100): Promise<TaskHistory[]> {
    const archivedTasks = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .where(eq(tasks.status, 'archived'))
      .orderBy(desc(tasks.archivedAt))
      .limit(limit);

    const result: TaskHistory[] = [];
    
    for (const row of archivedTasks) {
      const taskTimeEntries = await db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.taskId, row.tasks.id));

      const totalDuration = taskTimeEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);

      result.push({
        ...row.tasks,
        worker: row.workers!,
        totalDuration,
      });
    }

    return result;
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
    const searchPattern = `%${searchTerm}%`;
    
    const searchResults = await db
      .select()
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .where(and(
        eq(tasks.status, 'archived'),
        or(
          like(tasks.description, searchPattern),
          like(tasks.carBrand, searchPattern),
          like(tasks.carModel, searchPattern),
          like(tasks.licensePlate, searchPattern),
          like(workers.name, searchPattern)
        )
      ))
      .orderBy(desc(tasks.archivedAt));

    const result: TaskHistory[] = [];
    
    for (const row of searchResults) {
      const taskTimeEntries = await db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.taskId, row.tasks.id));

      const totalDuration = taskTimeEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);

      result.push({
        ...row.tasks,
        worker: row.workers!,
        totalDuration,
      });
    }

    return result;
  }

  async getWorkerStats() {
    const totalWorkers = await db.select().from(workers);
    const activeTasks = await db.select().from(tasks).where(eq(tasks.status, 'active'));
    
    const busyWorkerIds = new Set(activeTasks.map(task => task.workerId));
    const availableWorkers = totalWorkers.length - busyWorkerIds.size;

    return {
      totalWorkers: totalWorkers.length,
      availableWorkers,
      busyWorkers: busyWorkerIds.size,
      activeTasks: activeTasks.length,
    };
  }

  private calculateCurrentDuration(task: Task): number {
    if (!task.startTime) return 0;
    
    let endTime: Date;
    if (task.status === 'active') {
      endTime = new Date();
    } else if (task.endTime) {
      endTime = new Date(task.endTime);
    } else {
      return 0;
    }

    const startTime = new Date(task.startTime);
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  }
}

export const storage = new SQLiteStorage();