import { workers, tasks, timeEntries, customers, customerCars, users, partsRequests, receptionEntries, carStatus, type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory, type Customer, type InsertCustomer, type CustomerCar, type InsertCustomerCar, type CustomerWithCars, type User, type InsertUser, type PartsRequest, type InsertPartsRequest, type ReceptionEntry, type InsertReceptionEntry, type CarStatus, type InsertCarStatus } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, or, like, isNotNull, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Helper functions for data conversion
function parseTaskFromDB(taskFromDB: any): Task {
  const parseArrayField = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        // Try to parse as JSON first
        if (field.trim().startsWith('[')) {
          return JSON.parse(field);
        }
        // If it's a comma-separated string, split it
        if (field.includes(',')) {
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
        // Single value, return as single-item array
        return field.trim() ? [field.trim()] : [];
      } catch (e) {
        // If parsing fails, treat as single item or comma-separated
        if (field.includes(',')) {
          return field.split(',').map((item: string) => item.trim()).filter(Boolean);
        }
        return field.trim() ? [field.trim()] : [];
      }
    }
    return [];
  };

  return {
    ...taskFromDB,
    technicians: parseArrayField(taskFromDB.technicians),
    assistants: parseArrayField(taskFromDB.assistants),
  };
}

function serializeDateToString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

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
  cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task>;
  getArchivedTasks(limit?: number): Promise<TaskHistory[]>;
  searchArchive(searchTerm: string): Promise<TaskHistory[]>;
  
  // History and reporting  
  getTaskHistory(limit?: number): Promise<TaskHistory[]>;
  getWorkerStats(): Promise<{ totalWorkers: number; availableWorkers: number; busyWorkers: number; activeTasks: number }>;
  
  // Car data for autofill
  getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null>;
  
  // Customer management
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
  
  // Customer cars management
  getCustomerCars(): Promise<CustomerCar[]>;
  getCustomerCarsByCustomerId(customerId: number): Promise<CustomerCar[]>;
  getCustomerCar(id: number): Promise<CustomerCar | undefined>;
  createCustomerCar(car: InsertCustomerCar): Promise<CustomerCar>;
  updateCustomerCar(id: number, updates: Partial<InsertCustomerCar>): Promise<CustomerCar>;
  deleteCustomerCar(id: number): Promise<void>;
  
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserPermissions(username: string, permissions: string[]): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Parts requests management
  getPartsRequests(): Promise<PartsRequest[]>;
  getPartsRequest(id: number): Promise<PartsRequest | undefined>;
  createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest>;
  updatePartsRequestStatus(id: number, status: string, notes?: string): Promise<PartsRequest>;
  searchCarInfoForParts(searchTerm: string): Promise<{ carBrand: string; carModel: string; color?: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; customerName?: string } | null>;
  searchCustomerCars(searchTerm: string): Promise<{ customerName: string; carBrand: string; carModel: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; color?: string }[]>;
  getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]>;
  getTasksByLicensePlate(licensePlate: string): Promise<Task[]>;
  

  
  // Reception workflow management
  getReceptionEntries(): Promise<ReceptionEntry[]>;
  getReceptionEntry(id: number): Promise<ReceptionEntry | undefined>;
  createReceptionEntry(entry: InsertReceptionEntry): Promise<ReceptionEntry>;
  getWorkshopNotifications(): Promise<ReceptionEntry[]>;
  enterReceptionCarToWorkshop(entryId: number, workshopUserId: number): Promise<ReceptionEntry>;

  
  // Reception workflow management
  createReceptionEntry(entry: InsertReceptionEntry): Promise<ReceptionEntry>;
  getReceptionEntries(): Promise<ReceptionEntry[]>;
  getReceptionEntry(id: number): Promise<ReceptionEntry | undefined>;
  updateReceptionEntry(id: number, updates: Partial<ReceptionEntry>): Promise<ReceptionEntry>;

  // Car status management
  createCarStatus(carStatusData: InsertCarStatus): Promise<CarStatus>;
  getCarStatuses(): Promise<CarStatus[]>;
  getCarStatus(id: number): Promise<CarStatus | undefined>;
  updateCarStatus(id: number, updates: Partial<CarStatus>): Promise<CarStatus>;

  deleteCarStatus(id: number): Promise<void>;
  enterReceptionCarToWorkshop(id: number, workshopUserId: number): Promise<ReceptionEntry>;
  getWorkshopNotifications(): Promise<ReceptionEntry[]>;
  
  // Session store
  sessionStore: any;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  private parseJsonArray(jsonString: string | null | undefined): string[] {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
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
    const predefinedNames = ["خالد", "حكيم", "محمد العلي", "يزن", "عامر", "زياد", "علي", "عبد الحفيظ", "مصطفى", "حسام"];
    
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
    const predefinedNames = ["خالد", "حكيم", "محمد العلي", "يزن", "عامر", "زياد", "علي", "عبد الحفيظ", "مصطفى", "حسام"];
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
      ...parseTaskFromDB(task),
      currentDuration: this.calculateCurrentDuration(parseTaskFromDB(task)),
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

    console.log(`getActiveTasks: Found ${tasksData.length} tasks`);
    
    // Get time entries for active tasks
    const tasksWithEntries = await Promise.all(
      tasksData.map(async (task) => {
        const timeEntriesData = await db.query.timeEntries.findMany({
          where: eq(timeEntries.taskId, task.id),
        });
        return { ...task, timeEntries: timeEntriesData };
      })
    );

    return tasksWithEntries.map(task => {
      let duration = 0;
      
      if (task.timerType === 'manual' && task.consumedTime) {
        duration = task.consumedTime * 60;
      } else if (task.timeEntries && task.timeEntries.length > 0) {
        // Calculate duration from time entries (correct approach)
        duration = task.timeEntries.reduce((total, entry) => {
          if (entry.entryType === 'work') {
            if (entry.duration) {
              // Completed work session
              return total + entry.duration;
            } else if (entry.startTime && !entry.endTime) {
              // Active work session
              const entryStartTime = new Date(entry.startTime).getTime();
              const currentTime = Date.now();
              const sessionDuration = Math.max(0, (currentTime - entryStartTime) / 1000);
              return total + sessionDuration;
            }
          }
          return total;
        }, 0);
      }
      
      console.log(`Task ${task.id} - startTime: ${task.startTime} - calculated duration: ${duration}s`);
      
      const parsedTask = parseTaskFromDB(task);
      return {
        ...parsedTask,
        currentDuration: duration,
      };
    });
  }

  async getTask(id: number): Promise<TaskWithWorker | undefined> {
    const taskData = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        worker: true,
      },
    });

    if (!taskData) return undefined;

    const parsedTask = parseTaskFromDB(taskData);
    return {
      ...parsedTask,
      currentDuration: this.calculateCurrentDuration(parsedTask),
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    // Validate required fields
    if (!insertTask.workerId) {
      throw new Error("Worker ID is required");
    }
    
    // Generate simple sequential task number
    const lastTask = await db
      .select({ taskNumber: tasks.taskNumber })
      .from(tasks)
      .where(isNotNull(tasks.taskNumber))
      .orderBy(desc(tasks.id))
      .limit(1);
    
    let taskNumber = "1";
    if (lastTask.length > 0 && lastTask[0].taskNumber) {
      const lastNumber = parseInt(lastTask[0].taskNumber);
      if (!isNaN(lastNumber)) {
        taskNumber = String(lastNumber + 1);
      }
    }
    
    const [task] = await db
      .insert(tasks)
      .values({
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
        // تحويل المصفوفات إلى نص مفصول بفواصل بدلاً من JSON
        technicians: Array.isArray(insertTask.technicians) 
          ? insertTask.technicians.join(', ') 
          : (insertTask.technicians || null),
        assistants: Array.isArray(insertTask.assistants) 
          ? insertTask.assistants.join(', ') 
          : (insertTask.assistants || null),
        repairOperation: insertTask.repairOperation || null,
        taskType: insertTask.taskType || null,
        color: insertTask.color || null,
        timerType: insertTask.timerType || "automatic",
        consumedTime: insertTask.timerType === "manual" ? (insertTask.consumedTime || 0) : null,
        taskNumber,
        startTime: insertTask.timerType === "manual" ? null : null, // سيتم تعيينه في startTask
        status: insertTask.timerType === "manual" ? "completed" : "paused",
      })
      .returning();

    // Handle timer setup based on type
    if (insertTask.timerType === "manual") {
      // For manual timers, create a completed time entry with the consumed time
      const consumedMinutes = insertTask.consumedTime || insertTask.estimatedDuration || 0;
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (consumedMinutes * 60 * 1000));
      
      await db.insert(timeEntries).values({
        taskId: task.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: consumedMinutes * 60,
        entryType: "work",
      });
      
      // أرشفة المهمة فوراً مع المؤقت اليدوي
      await db.update(tasks)
        .set({ 
          status: "completed",
          endTime: endTime.toISOString(),
          isArchived: true,
          archivedAt: new Date().toISOString(),
          archivedBy: "نظام المؤقت اليدوي",
          archiveNotes: "تم أرشفة المهمة تلقائياً - مؤقت يدوي",
          totalPausedDuration: consumedMinutes * 60
        })
        .where(eq(tasks.id, task.id));
      
      return task;
    }

    // For automatic timers, start the timer immediately after task creation
    if (insertTask.timerType !== "manual") {
      await this.startTask(task.id);
    }

    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    // Convert date strings to Date objects if provided
    const processedUpdates = { ...updates };
    
    // إصلاح مشكلة endTime - إذا كان فارغ يصبح null
    if (updates.endTime !== undefined) {
      if (updates.endTime === '' || updates.endTime === null) {
        processedUpdates.endTime = null;
      } else if (typeof updates.endTime === 'string') {
        processedUpdates.endTime = new Date(updates.endTime);
      }
    }
    
    if (updates.createdAt && typeof updates.createdAt === 'string') {
      processedUpdates.createdAt = new Date(updates.createdAt);
    }
    
    const [task] = await db
      .update(tasks)
      .set(processedUpdates)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async startTask(taskId: number): Promise<TimeEntry> {
    // الحصول على التوقيت السوري الدقيق
    const now = new Date();
    const syrianTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Damascus',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    
    const startTimeStr = `${syrianTime.find(p => p.type === 'year')?.value}-${syrianTime.find(p => p.type === 'month')?.value}-${syrianTime.find(p => p.type === 'day')?.value} ${syrianTime.find(p => p.type === 'hour')?.value}:${syrianTime.find(p => p.type === 'minute')?.value}:${syrianTime.find(p => p.type === 'second')?.value}`;
    
    // Get current task to check if it's the first start
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    
    // Only set startTime if it's not already set (first start)
    const updateData: any = {
      status: "active",
      pausedAt: null,
    };
    
    if (!currentTask?.startTime) {
      updateData.startTime = startTimeStr;
    }
    
    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    const [timeEntry] = await db
      .insert(timeEntries)
      .values({
        taskId,
        startTime: now,
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
      const startTime = currentEntry.startTime instanceof Date 
        ? currentEntry.startTime 
        : new Date(currentEntry.startTime);
      currentSessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
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

  async cancelTask(taskId: number, reason?: string, cancelledBy?: string): Promise<Task> {
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
      const startTime = new Date(currentEntry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: now,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }

    // Update task status to cancelled
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed", // استخدام completed ووضع علامة الإلغاء
        endTime: now,
        isCancelled: true,
        cancellationReason: reason || 'تم إلغاء المهمة',
        cancelledBy: cancelledBy || 'مجهول',
        cancelledAt: now.toISOString(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
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
      const startTime = new Date(currentEntry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: now,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }

    // حساب المدة الفعلية من time_entries (الأكثر دقة)
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    // حساب المدة الفعلية من time_entries
    const allTimeEntries = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId));
    
    let actualDurationSeconds = 0;
    if (existingTask && existingTask.timerType === 'manual' && existingTask.consumedTime) {
      // للمهام اليدوية: استخدم الوقت المدخل
      actualDurationSeconds = existingTask.consumedTime * 60;
    } else {
      // للمهام الأوتوماتيكية: احسب من time_entries
      actualDurationSeconds = allTimeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0);
    }

    // Update task status to completed (will show in task history)
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        endTime: now, // تاريخ إنهاء المهمة - وقت الضغط على "إنهاء"
        consumedTime: Math.round(actualDurationSeconds / 60), // حفظ المدة الفعلية بالدقائق
        totalPausedDuration: actualDurationSeconds, // حفظ المدة الفعلية بالثواني للعرض
      })
      .where(eq(tasks.id, taskId))
      .returning();

    console.log(`🏁 تم إنهاء المهمة ${taskId} - تنتقل الآن لسجل المهام`);
    return task;
  }

  async getTaskHistory(limit: number = 50): Promise<TaskHistory[]> {
    const tasksData = await db.query.tasks.findMany({
      where: and(
        eq(tasks.status, "completed"), // فقط المهام المكتملة وليس المؤرشفة
        eq(tasks.isArchived, false) // وليست مؤرشفة بعد
      ),
      with: {
        worker: true,
        timeEntries: true,
      },
      orderBy: [desc(tasks.endTime)], // ترتيب حسب وقت الإنهاء
      limit,
    });

    return tasksData.map(task => ({
      ...task,
      totalDuration: task.totalPausedDuration || this.calculateCurrentDuration(task),
    }));
  }

  async archiveTask(taskId: number, archivedBy: string, notes?: string, rating?: number): Promise<Task> {
    const now = new Date();
    
    // Get the next delivery number
    const lastArchivedTask = await db.query.tasks.findFirst({
      where: eq(tasks.isArchived, true),
      orderBy: [desc(tasks.deliveryNumber)],
    });
    
    const nextDeliveryNumber = (lastArchivedTask?.deliveryNumber || 0) + 1;
    
    const [task] = await db
      .update(tasks)
      .set({
        isArchived: true,
        archivedAt: now, // تاريخ التسليم - وقت الضغط على "تسليم" من السجل
        archivedBy,
        archiveNotes: notes,
        rating: rating || null,
        status: "archived",
        deliveryNumber: nextDeliveryNumber,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    console.log(`📦 تم تسليم المهمة ${taskId} للأرشيف بواسطة ${archivedBy}`);
    return task;
  }

  async deliverTask(taskId: number, deliveredBy: string, rating: number = 3, notes?: string): Promise<Task> {
    // الحصول على التوقيت السوري الدقيق للإنهاء
    const now = new Date();
    const syrianTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Damascus',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    
    const endTimeStr = `${syrianTime.find(p => p.type === 'year')?.value}-${syrianTime.find(p => p.type === 'month')?.value}-${syrianTime.find(p => p.type === 'day')?.value} ${syrianTime.find(p => p.type === 'hour')?.value}:${syrianTime.find(p => p.type === 'minute')?.value}:${syrianTime.find(p => p.type === 'second')?.value}`;
    
    // إنهاء أي جلسة وقت نشطة
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
      const startTime = new Date(currentEntry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: endTimeStr,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }
    
    // الحصول على المهمة لحساب المدة الفعلية والنسبة المئوية
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });
    
    if (!existingTask) {
      throw new Error('المهمة غير موجودة');
    }
    
    // حساب المدة الفعلية من time_entries (الأكثر دقة)
    const allTimeEntries = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId));
    
    let actualDurationSeconds = 0;
    
    if (existingTask.timerType === 'manual' && existingTask.consumedTime) {
      // للمهام اليدوية: استخدم الوقت المدخل
      actualDurationSeconds = existingTask.consumedTime * 60;
    } else {
      // للمهام الأوتوماتيكية: احسب من time_entries
      actualDurationSeconds = allTimeEntries.reduce((total, entry) => {
        return total + (entry.duration || 0);
      }, 0);
    }
    
    // حساب النسبة المئوية (الكفاءة)
    let efficiencyPercentage = 100;
    
    if (existingTask.estimatedDuration && existingTask.estimatedDuration > 0 && actualDurationSeconds > 0) {
      const estimatedSeconds = existingTask.estimatedDuration * 60; // تحويل من دقائق إلى ثوان
      // الكفاءة = (الوقت المقدر ÷ الوقت الفعلي) × 100
      efficiencyPercentage = Math.round((estimatedSeconds / actualDurationSeconds) * 100);
      efficiencyPercentage = Math.max(efficiencyPercentage, 10); // حد أدنى 10%
    }
    
    // الحصول على آخر رقم تسليم
    const lastArchivedTask = await db.query.tasks.findFirst({
      where: eq(tasks.isArchived, true),
      orderBy: [desc(tasks.deliveryNumber)],
    });
    
    const nextDeliveryNumber = (lastArchivedTask?.deliveryNumber || 0) + 1;
    
    console.log(`📊 حساب المدة الفعلية للمهمة ${taskId}:`, {
      actualDurationSeconds,
      estimatedDuration: existingTask.estimatedDuration,
      efficiencyPercentage,
      timerType: existingTask.timerType
    });

    // تحديث المهمة للأرشيف مع كامل المعلومات والحسابات الصحيحة  
    const [task] = await db
      .update(tasks)
      .set({
        status: "archived",
        endTime: endTimeStr,
        consumedTime: Math.round(actualDurationSeconds / 60), // حفظ بالدقائق
        totalPausedDuration: actualDurationSeconds, // حفظ بالثواني في totalPausedDuration
        isArchived: true,
        archivedAt: endTimeStr,
        archivedBy: deliveredBy,
        archiveNotes: notes || `تم التسليم - المدة الفعلية: ${Math.round(actualDurationSeconds / 60)} دقيقة - النسبة: ${efficiencyPercentage}%`,
        rating: rating,
        deliveryNumber: nextDeliveryNumber,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
  }

  async getArchivedTasks(limit: number = 100): Promise<TaskHistory[]> {
    // استخدام SQL مباشر للحصول على معلومات الزبون من مصادر متعددة
    const tasksWithCustomers = await db
      .select({
        // بيانات المهمة
        id: tasks.id,
        taskNumber: tasks.taskNumber,
        workerId: tasks.workerId,
        workerRole: tasks.workerRole,
        description: tasks.description,
        carBrand: tasks.carBrand,
        carModel: tasks.carModel,
        licensePlate: tasks.licensePlate,
        estimatedDuration: tasks.estimatedDuration,
        engineerName: tasks.engineerName,
        supervisorName: tasks.supervisorName,
        assistantName: tasks.assistantName,
        technicianName: tasks.technicianName,
        technicians: tasks.technicians,
        assistants: tasks.assistants,
        repairOperation: tasks.repairOperation,
        taskType: tasks.taskType,
        invoiceType: tasks.invoiceType,
        color: tasks.color,
        timerType: tasks.timerType,
        consumedTime: tasks.consumedTime,
        status: tasks.status,
        startTime: tasks.startTime,
        endTime: tasks.endTime,
        totalPausedDuration: tasks.totalPausedDuration,
        isArchived: tasks.isArchived,
        archivedAt: tasks.archivedAt,
        archivedBy: tasks.archivedBy,
        archiveNotes: tasks.archiveNotes,
        rating: tasks.rating,
        deliveryNumber: tasks.deliveryNumber,
        createdAt: tasks.createdAt,
        // بيانات العامل
        workerName: workers.name,
        workerCategory: workers.category,
        // بيانات الزبون من customer_cars أو car_status
        customerNameFromCars: customers.name,
        customerPhone: customers.phoneNumber,
        customerNameFromStatus: carStatus.customerName,
      })
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .leftJoin(customerCars, eq(tasks.licensePlate, customerCars.licensePlate))
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .leftJoin(carStatus, eq(tasks.licensePlate, carStatus.licensePlate))
      .where(eq(tasks.isArchived, true))
      .orderBy(desc(tasks.archivedAt))
      .limit(limit);

    return tasksWithCustomers.map(task => ({
      ...task,
      // استخدام اسم العميل من car_status إذا لم يكن موجود في customer_cars
      customerName: task.customerNameFromCars || task.customerNameFromStatus || 'غير محدد',
      worker: {
        id: task.workerId,
        name: task.workerName,
        category: task.workerCategory,
      },
      totalDuration: task.totalPausedDuration || 0,
      technicians: this.parseJsonArray(task.technicians),
      assistants: this.parseJsonArray(task.assistants),
    }));
  }

  async searchArchive(searchTerm: string): Promise<TaskHistory[]> {
    // البحث مع ربط جداول الزبائن
    const tasksWithCustomers = await db
      .select({
        // بيانات المهمة
        id: tasks.id,
        taskNumber: tasks.taskNumber,
        workerId: tasks.workerId,
        workerRole: tasks.workerRole,
        description: tasks.description,
        carBrand: tasks.carBrand,
        carModel: tasks.carModel,
        licensePlate: tasks.licensePlate,
        estimatedDuration: tasks.estimatedDuration,
        engineerName: tasks.engineerName,
        supervisorName: tasks.supervisorName,
        assistantName: tasks.assistantName,
        technicianName: tasks.technicianName,
        technicians: tasks.technicians,
        assistants: tasks.assistants,
        repairOperation: tasks.repairOperation,
        taskType: tasks.taskType,
        invoiceType: tasks.invoiceType,
        color: tasks.color,
        timerType: tasks.timerType,
        consumedTime: tasks.consumedTime,
        status: tasks.status,
        startTime: tasks.startTime,
        endTime: tasks.endTime,
        totalPausedDuration: tasks.totalPausedDuration,
        isArchived: tasks.isArchived,
        archivedAt: tasks.archivedAt,
        archivedBy: tasks.archivedBy,
        archiveNotes: tasks.archiveNotes,
        rating: tasks.rating,
        deliveryNumber: tasks.deliveryNumber,
        createdAt: tasks.createdAt,
        // بيانات العامل
        workerName: workers.name,
        workerCategory: workers.category,
        // بيانات الزبون من customer_cars أو car_status
        customerNameFromCars: customers.name,
        customerPhone: customers.phoneNumber,
        customerNameFromStatus: carStatus.customerName,
      })
      .from(tasks)
      .leftJoin(workers, eq(tasks.workerId, workers.id))
      .leftJoin(customerCars, eq(tasks.licensePlate, customerCars.licensePlate))
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .leftJoin(carStatus, eq(tasks.licensePlate, carStatus.licensePlate))
      .where(and(
        eq(tasks.isArchived, true),
        or(
          like(tasks.description, `%${searchTerm}%`),
          like(tasks.carModel, `%${searchTerm}%`),
          like(tasks.licensePlate, `%${searchTerm}%`),
          like(tasks.archiveNotes, `%${searchTerm}%`),
          like(customers.name, `%${searchTerm}%`), // البحث في اسم الزبون من customer_cars
          like(carStatus.customerName, `%${searchTerm}%`), // البحث في اسم الزبون من car_status
          like(customerCars.chassisNumber, `%${searchTerm}%`) // البحث في رقم الشاسيه
        )
      ))
      .orderBy(desc(tasks.archivedAt))
      .limit(50);

    return tasksWithCustomers.map(task => ({
      ...task,
      // استخدام اسم العميل من car_status إذا لم يكن موجود في customer_cars
      customerName: task.customerNameFromCars || task.customerNameFromStatus || 'غير محدد',
      worker: {
        id: task.workerId,
        name: task.workerName,
        category: task.workerCategory,
      },
      totalDuration: task.totalPausedDuration || 0,
      technicians: this.parseJsonArray(task.technicians),
      assistants: this.parseJsonArray(task.assistants),
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
    console.log(`=== CALCULATING DURATION FOR TASK ${task.id} ===`);
    console.log(`Status: ${task.status}, TimerType: ${task.timerType}`);
    console.log(`StartTime: ${task.startTime}, EndTime: ${task.endTime}`);
    
    // For manual timer tasks
    if (task.timerType === 'manual' && task.consumedTime) {
      const duration = task.consumedTime * 60;
      console.log(`Manual timer: ${duration} seconds`);
      return duration;
    }
    
    // For automatic tasks - must have startTime
    if (!task.startTime) {
      console.log(`No startTime, returning 0`);
      return 0;
    }
    
    try {
      // تعامل مع startTime كـ UTC دائماً
      const startTimeStr = task.startTime.includes('Z') ? task.startTime : task.startTime + 'Z';
      const startTime = new Date(startTimeStr);
      let endTime: Date;
      
      // Determine end time based on status
      if (task.status === 'completed' && task.endTime) {
        const endTimeStr = task.endTime.includes('Z') ? task.endTime : task.endTime + 'Z';
        endTime = new Date(endTimeStr);
        console.log(`Completed task, using endTime: ${endTimeStr}`);
      } else if (task.status === 'paused' && task.pausedAt) {
        const pausedTimeStr = task.pausedAt.includes('Z') ? task.pausedAt : task.pausedAt + 'Z';
        endTime = new Date(pausedTimeStr);
        console.log(`Paused task, using pausedAt: ${pausedTimeStr}`);
      } else {
        endTime = new Date();
        console.log(`Active task, using current time: ${endTime.toISOString()}`);
      }
      
      // Calculate duration in seconds
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationSeconds = durationMs / 1000;
      const pausedSeconds = task.totalPausedDuration || 0;
      const finalDuration = Math.max(0, durationSeconds - pausedSeconds);
      
      console.log(`Duration calc: startTime=${startTimeStr}, durationSeconds=${durationSeconds}s, pausedSeconds=${pausedSeconds}s, final=${finalDuration}s`);
      return finalDuration;
      
    } catch (error) {
      console.error(`Error calculating duration for task ${task.id}:`, error);
      return 0;
    }

  }

  async getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null> {
    // Search in active tasks first
    const activeTask = await db.query.tasks.findFirst({
      where: eq(tasks.licensePlate, licensePlate),
      orderBy: [desc(tasks.createdAt)],
    });

    if (activeTask) {
      return {
        carBrand: activeTask.carBrand,
        carModel: activeTask.carModel,
        color: (activeTask as any).color || undefined,
      };
    }

    // If not found in active tasks, search in archived tasks
    const archivedTask = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.licensePlate, licensePlate),
        eq(tasks.isArchived, true)
      ),
      orderBy: [desc(tasks.archivedAt)],
    });

    if (archivedTask) {
      return {
        carBrand: archivedTask.carBrand,
        carModel: archivedTask.carModel,
        color: (archivedTask as any).color || undefined,
      };
    }

    return null;
  }

  // Customer management methods
  async getCustomers(): Promise<Customer[]> {
    return await db.query.customers.findMany({
      orderBy: [desc(customers.createdAt)],
    });
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return await db.query.customers.findFirst({
      where: eq(customers.id, id),
    });
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Check for existing customer with same name AND phone number
    const existingCustomer = await db.query.customers.findFirst({
      where: or(
        and(
          eq(customers.name, customer.name),
          eq(customers.phoneNumber, customer.phoneNumber)
        ),
        // Also check just name for exact duplicates
        eq(customers.name, customer.name)
      )
    });

    if (existingCustomer) {
      throw new Error(`زبون بالاسم "${customer.name}" موجود مسبقاً. يرجى استخدام اسم مختلف.`);
    }

    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Customer cars management methods
  async getCustomerCars(): Promise<CustomerCar[]> {
    return await db.query.customerCars.findMany({
      orderBy: [desc(customerCars.createdAt)],
    });
  }

  async getCustomerCarsByCustomerId(customerId: number): Promise<CustomerCar[]> {
    return await db.query.customerCars.findMany({
      where: eq(customerCars.customerId, customerId),
      orderBy: [desc(customerCars.createdAt)],
    });
  }

  async getCustomerCar(id: number): Promise<CustomerCar | undefined> {
    return await db.query.customerCars.findFirst({
      where: eq(customerCars.id, id),
    });
  }

  async createCustomerCar(car: InsertCustomerCar): Promise<CustomerCar> {
    const [newCar] = await db.insert(customerCars).values(car).returning();
    return newCar;
  }

  async updateCustomerCar(id: number, updates: Partial<InsertCustomerCar>): Promise<CustomerCar> {
    const [updatedCar] = await db
      .update(customerCars)
      .set(updates)
      .where(eq(customerCars.id, id))
      .returning();
    return updatedCar;
  }

  async deleteCustomerCar(id: number): Promise<void> {
    await db.delete(customerCars).where(eq(customerCars.id, id));
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPermissions(username: string, permissions: string[]): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ permissions })
      .where(eq(users.username, username))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Parts requests management
  async getPartsRequests(): Promise<PartsRequest[]> {
    return await db.select().from(partsRequests).orderBy(desc(partsRequests.requestedAt));
  }

  async getPartsRequest(id: number): Promise<PartsRequest | undefined> {
    const [request] = await db.select().from(partsRequests).where(eq(partsRequests.id, id));
    return request || undefined;
  }

  async createPartsRequest(request: InsertPartsRequest): Promise<PartsRequest> {
    // Generate sequential request number based on the highest existing number
    const existingRequests = await db.select().from(partsRequests);
    let maxNumber = 0;
    
    for (const req of existingRequests) {
      if (req.requestNumber && req.requestNumber.startsWith('طلب-')) {
        const num = parseInt(req.requestNumber.substring(4));
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    
    const requestNumber = `طلب-${maxNumber + 1}`;
    
    const now = new Date();
    const localTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours for Syria time
    const timeString = localTime.toISOString().replace('T', ' ').split('.')[0];
    
    const [newRequest] = await db
      .insert(partsRequests)
      .values({
        ...request,
        requestNumber,
        requestedAt: timeString,
        licensePlate: request.licensePlate || null,
        chassisNumber: request.chassisNumber || null,
        engineCode: request.engineCode || null,
      })
      .returning();

    // Update car status parts count if license plate matches
    if (request.licensePlate) {
      try {
        const carStatusResult = await db.select()
          .from(carStatus)
          .where(eq(carStatus.licensePlate, request.licensePlate))
          .limit(1);
        
        if (carStatusResult.length > 0) {
          const currentStatus = carStatusResult[0];
          await this.updateCarStatus(currentStatus.id, {
            partsRequestsCount: (currentStatus.partsRequestsCount || 0) + 1,
            currentStatus: "بانتظار قطع",
          });
        }
      } catch (error) {
        console.error('Error updating car status for parts request:', error);
      }
    }
    
    return newRequest;
  }

  async updatePartsRequestStatus(id: number, status: string, notes?: string, estimatedArrival?: string): Promise<PartsRequest> {
    const updateData: any = { status };
    const now = new Date();
    const localTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours for Syria time
    const timeString = localTime.toISOString().replace('T', ' ').split('.')[0];
    
    // تسجيل الأوقات حسب الحالة - استخدام نفس تنسيق requestedAt
    if (status === "approved") {
      updateData.approvedAt = timeString;
    } else if (status === "in_preparation") {
      updateData.inPreparationAt = timeString;
      updateData.approvedAt = timeString; // تسجيل وقت الموافقة أيضاً
    } else if (status === "awaiting_pickup") {
      updateData.readyForPickupAt = timeString;
    } else if (status === "ordered_externally") {
      updateData.orderedExternallyAt = timeString;
      updateData.orderedExternallyBy = "هبة"; // يمكن تحسين هذا لاحقاً
      if (estimatedArrival) {
        updateData.estimatedArrival = estimatedArrival;
      }
    } else if (status === "parts_arrived") {
      updateData.partsArrivedAt = timeString;
      updateData.partsArrivedBy = "بدوي"; // يمكن تحسين هذا لاحقاً
    } else if (status === "unavailable") {
      updateData.unavailableAt = timeString;
      updateData.unavailableBy = "هبة"; // يمكن تحسين هذا لاحقاً
    } else if (status === "delivered") {
      updateData.deliveredAt = timeString;
      updateData.deliveredBy = "بدوي"; // يمكن تحسين هذا لاحقاً
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    const [updated] = await db
      .update(partsRequests)
      .set(updateData)
      .where(eq(partsRequests.id, id))
      .returning();

    // Update car status parts count if status changes to delivered
    if (status === "delivered" && updated.licensePlate) {
      try {
        const carStatusResult = await db.select()
          .from(carStatus)
          .where(eq(carStatus.licensePlate, updated.licensePlate))
          .limit(1);
        
        if (carStatusResult.length > 0) {
          const currentStatus = carStatusResult[0];
          await this.updateCarStatus(currentStatus.id, {
            completedPartsCount: (currentStatus.completedPartsCount || 0) + 1,
          });
        }
      } catch (error) {
        console.error('Error updating car status for parts delivery:', error);
      }
    }
    
    return updated;
  }

  async searchCarInfoForParts(searchTerm: string): Promise<{ carBrand: string; carModel: string; color?: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; customerName?: string } | null> {
    // Search in customer cars by license plate first (exact match)
    const [exactMatch] = await db
      .select({
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        color: customerCars.color,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        customerName: customers.name,
      })
      .from(customerCars)
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .where(eq(customerCars.licensePlate, searchTerm))
      .limit(1);
    
    if (exactMatch) {
      return {
        carBrand: exactMatch.carBrand,
        carModel: exactMatch.carModel,
        color: exactMatch.color || undefined,
        licensePlate: exactMatch.licensePlate || undefined,
        chassisNumber: exactMatch.chassisNumber || undefined,
        engineCode: exactMatch.engineCode || undefined,
        customerName: exactMatch.customerName || undefined,
      };
    }
    
    // If no exact match, search by partial match in license plate, chassis number, or customer name
    const [partialMatch] = await db
      .select({
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        color: customerCars.color,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        customerName: customers.name,
      })
      .from(customerCars)
      .leftJoin(customers, eq(customerCars.customerId, customers.id))
      .where(
        or(
          like(customerCars.licensePlate, `%${searchTerm}%`),
          like(customerCars.chassisNumber, `%${searchTerm}%`),
          like(customers.name, `%${searchTerm}%`)
        )
      )
      .limit(1);
    
    return partialMatch ? {
      carBrand: partialMatch.carBrand,
      carModel: partialMatch.carModel,
      color: partialMatch.color || undefined,
      licensePlate: partialMatch.licensePlate || undefined,
      chassisNumber: partialMatch.chassisNumber || undefined,
      engineCode: partialMatch.engineCode || undefined,
      customerName: partialMatch.customerName || undefined,
    } : null;
  }

  // Return parts request
  async returnPartsRequest(id: number, returnedBy: string, returnReason: string): Promise<PartsRequest> {
    const [returnedRequest] = await db
      .update(partsRequests)
      .set({
        status: 'returned',
        returnedAt: new Date().toISOString(),
        returnedBy: returnedBy,
        returnReason: returnReason,
      })
      .where(eq(partsRequests.id, id))
      .returning();

    return returnedRequest;
  }

  // Update parts request notes
  async updatePartsRequestNotes(id: number, userNotes: string): Promise<PartsRequest> {
    const [updatedRequest] = await db
      .update(partsRequests)
      .set({
        userNotes: userNotes,
      })
      .where(eq(partsRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]> {
    const requests = await db.select()
      .from(partsRequests)
      .where(
        or(
          eq(partsRequests.licensePlate, licensePlate),
          like(partsRequests.licensePlate, `%${licensePlate}%`)
        )
      )
      .orderBy(desc(partsRequests.requestedAt));
    
    return requests;
  }

  async getTasksByLicensePlate(licensePlate: string): Promise<Task[]> {
    const taskList = await db.select()
      .from(tasks)
      .where(
        or(
          eq(tasks.licensePlate, licensePlate),
          like(tasks.licensePlate, `%${licensePlate}%`)
        )
      )
      .orderBy(desc(tasks.createdAt));
    
    return taskList;
  }



  // Missing methods implementation
  async getCarDataByLicensePlate(licensePlate: string): Promise<{ carBrand: string; carModel: string; color?: string } | null> {
    const [car] = await db
      .select({
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        color: customerCars.color,
      })
      .from(customerCars)
      .where(eq(customerCars.licensePlate, licensePlate))
      .limit(1);

    return car ? {
      carBrand: car.carBrand,
      carModel: car.carModel,
      color: car.color || undefined,
    } : null;
  }

  private calculateCurrentDuration(task: any): number {
    // TODO: Implement proper duration calculation based on time entries
    return 0;
  }

  // Reception workflow management implementation
  async createReceptionEntry(entry: InsertReceptionEntry): Promise<ReceptionEntry> {
    const [receptionEntry] = await db
      .insert(receptionEntries)
      .values({
        ...entry,
        status: "reception"
      })
      .returning();
    
    return receptionEntry;
  }

  async getReceptionEntries(): Promise<ReceptionEntry[]> {
    const entries = await db
      .select()
      .from(receptionEntries)
      .orderBy(desc(receptionEntries.entryTime));
    
    return entries;
  }

  async getReceptionEntry(id: number): Promise<ReceptionEntry | undefined> {
    const [entry] = await db
      .select()
      .from(receptionEntries)
      .where(eq(receptionEntries.id, id));
    
    return entry || undefined;
  }

  async updateReceptionEntry(id: number, updates: Partial<ReceptionEntry>): Promise<ReceptionEntry> {
    const [entry] = await db
      .update(receptionEntries)
      .set(updates)
      .where(eq(receptionEntries.id, id))
      .returning();
    
    return entry;
  }

  async enterReceptionCarToWorkshop(id: number, workshopUserId: number): Promise<ReceptionEntry> {
    const now = new Date();
    
    const [entry] = await db
      .update(receptionEntries)
      .set({
        status: "workshop",
        workshopUserId,
        workshopEntryTime: now
      })
      .where(eq(receptionEntries.id, id))
      .returning();
    
    return entry;
  }

  async getWorkshopNotifications(): Promise<ReceptionEntry[]> {
    const entries = await db
      .select()
      .from(receptionEntries)
      .where(eq(receptionEntries.status, "reception"))
      .orderBy(desc(receptionEntries.entryTime));
    
    return entries;
  }

  // Car status management methods
  async createCarStatus(carStatusData: InsertCarStatus): Promise<CarStatus> {
    const [carStatusRecord] = await db
      .insert(carStatus)
      .values({
        ...carStatusData,
        updatedAt: new Date(),
      })
      .returning();
    
    return carStatusRecord;
  }

  async getCarStatuses(): Promise<CarStatus[]> {
    // Get existing car statuses with complete customer data
    const statuses = await db
      .select({
        id: carStatus.id,
        customerName: carStatus.customerName,
        carBrand: carStatus.carBrand,
        carModel: carStatus.carModel,
        licensePlate: carStatus.licensePlate,
        currentStatus: carStatus.currentStatus,
        maintenanceType: carStatus.maintenanceType,
        complaints: carStatus.complaints,
        kmReading: carStatus.kmReading,
        fuelLevel: carStatus.fuelLevel,
        partsRequestsCount: carStatus.partsRequestsCount,
        completedPartsCount: carStatus.completedPartsCount,
        receivedAt: carStatus.receivedAt,
        enteredWorkshopAt: carStatus.enteredWorkshopAt,
        completedAt: carStatus.completedAt,
        returnedToReceptionAt: carStatus.returnedToReceptionAt,
        returnedBy: carStatus.returnedBy,
        deliveredAt: carStatus.deliveredAt,
        updatedAt: carStatus.updatedAt,
        createdAt: carStatus.createdAt,
      })
      .from(carStatus)
      .orderBy(desc(carStatus.updatedAt));
    
    // For missing customer names in car_status, let's update them from customer_cars
    for (const status of statuses) {
      if (!status.customerName || status.customerName === 'غير محدد') {
        const customerData = await db
          .select({
            customerName: customers.name,
            carBrand: customerCars.carBrand,
            carModel: customerCars.carModel,
          })
          .from(customerCars)
          .leftJoin(customers, eq(customerCars.customerId, customers.id))
          .where(eq(customerCars.licensePlate, status.licensePlate))
          .limit(1);
        
        if (customerData[0] && customerData[0].customerName) {
          status.customerName = customerData[0].customerName;
          if (status.carBrand === 'غير محدد' && customerData[0].carBrand) {
            status.carBrand = customerData[0].carBrand;
          }
          if (status.carModel === 'غير محدد' && customerData[0].carModel) {
            status.carModel = customerData[0].carModel;
          }
        }
      }
    }
    
    return statuses;
  }

  async getCarStatus(id: number): Promise<CarStatus | undefined> {
    const [status] = await db
      .select()
      .from(carStatus)
      .where(eq(carStatus.id, id));
    
    return status || undefined;
  }

  async updateCarStatus(id: number, updates: Partial<CarStatus>): Promise<CarStatus> {
    const [status] = await db
      .update(carStatus)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(carStatus.id, id))
      .returning();
    
    return status;
  }



  async deleteCarStatus(id: number): Promise<void> {
    await db.delete(carStatus).where(eq(carStatus.id, id));
  }

  async updateCarStatusByReceiptId(receiptId: number, updates: Partial<CarStatus>): Promise<CarStatus> {
    const [status] = await db
      .update(carStatus)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(carStatus.receiptId, receiptId))
      .returning();
    
    if (!status) {
      throw new Error(`Car status with receiptId ${receiptId} not found`);
    }
    
    return status;
  }

  async searchCustomerCars(searchTerm: string): Promise<{ customerName: string; carBrand: string; carModel: string; licensePlate?: string; chassisNumber?: string; engineCode?: string; color?: string }[]> {
    const searchPattern = `%${searchTerm}%`;
    
    // البحث في جدول العملاء والسيارات
    const results = await db
      .select({
        customerName: customers.name,
        carBrand: customerCars.carBrand,
        carModel: customerCars.carModel,
        licensePlate: customerCars.licensePlate,
        chassisNumber: customerCars.chassisNumber,
        engineCode: customerCars.engineCode,
        color: customerCars.color,
      })
      .from(customerCars)
      .leftJoin(customers, eq(customers.id, customerCars.customerId))
      .where(
        or(
          like(customers.name, searchPattern),
          like(customerCars.licensePlate, searchPattern),
          like(customerCars.chassisNumber, searchPattern)
        )
      )
      .orderBy(customers.name, customerCars.carBrand);

    return results.map(result => ({
      customerName: result.customerName || '',
      carBrand: result.carBrand,
      carModel: result.carModel || '',
      licensePlate: result.licensePlate || undefined,
      chassisNumber: result.chassisNumber || undefined,
      engineCode: result.engineCode || undefined,
      color: result.color || undefined,
    }));
  }

  async returnTaskToReception(taskId: number, returnedBy: string): Promise<Task> {
    // الحصول على التوقيت السوري الدقيق
    const now = new Date();
    const syrianTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Damascus',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    
    const currentTimeStr = `${syrianTime.find(p => p.type === 'year')?.value}-${syrianTime.find(p => p.type === 'month')?.value}-${syrianTime.find(p => p.type === 'day')?.value} ${syrianTime.find(p => p.type === 'hour')?.value}:${syrianTime.find(p => p.type === 'minute')?.value}:${syrianTime.find(p => p.type === 'second')?.value}`;
    
    // إنهاء أي جلسة وقت نشطة
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
      const startTime = new Date(currentEntry.startTime);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      await db
        .update(timeEntries)
        .set({
          endTime: currentTimeStr,
          duration,
        })
        .where(eq(timeEntries.id, currentEntry.id));
    }
    
    // تحديث المهمة لحالة "تم التسليم للاستقبال"
    const [task] = await db
      .update(tasks)
      .set({
        status: "paused",
        pausedAt: currentTimeStr,
        pauseReason: "تم تسليم السيارة للاستقبال",
        pauseNotes: `تم التسليم للاستقبال بواسطة ${returnedBy} في ${currentTimeStr}`,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
  }
}

export const storage = new DatabaseStorage();
