import { workers, tasks, timeEntries, customers, customerCars, users, partsRequests, carReceipts, type Worker, type InsertWorker, type Task, type InsertTask, type TimeEntry, type InsertTimeEntry, type WorkerWithTasks, type TaskWithWorker, type TaskHistory, type Customer, type InsertCustomer, type CustomerCar, type InsertCustomerCar, type CustomerWithCars, type User, type InsertUser, type PartsRequest, type InsertPartsRequest, type CarReceipt, type InsertCarReceipt } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, or, like, isNotNull, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
  getPartsRequestsByLicensePlate(licensePlate: string): Promise<PartsRequest[]>;
  getTasksByLicensePlate(licensePlate: string): Promise<Task[]>;
  
  // Car receipts management
  createCarReceipt(receiptData: InsertCarReceipt): Promise<CarReceipt>;
  getCarReceipts(): Promise<CarReceipt[]>;
  getCarReceiptById(id: number): Promise<CarReceipt | undefined>;
  updateCarReceipt(id: number, updates: Partial<InsertCarReceipt>): Promise<CarReceipt>;
  deleteCarReceipt(id: number): Promise<void>;
  sendCarReceiptToWorkshop(id: number, sentBy: string): Promise<CarReceipt>;
  enterCarToWorkshop(id: number, enteredBy: string): Promise<CarReceipt>;
  
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
    const predefinedNames = ["غدير", "يحيى", "حسام", "مصطفى", "زياد", "سليمان", "حسن"];
    
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
    const predefinedNames = ["غدير", "يحيى", "حسام", "سليمان", "زياد", "حسن"];
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
        technicians: insertTask.technicians || null,
        assistants: insertTask.assistants || null,
        repairOperation: insertTask.repairOperation || null,
        taskType: insertTask.taskType || null,
        color: insertTask.color || null,
        timerType: insertTask.timerType || "automatic",
        consumedTime: insertTask.timerType === "manual" ? (insertTask.consumedTime || 0) : null,
        taskNumber,
        startTime: insertTask.timerType === "manual" ? null : new Date(),
        status: insertTask.timerType === "manual" ? "completed" : "paused",
      })
      .returning();

    // Handle timer setup based on type
    if (insertTask.timerType === "manual") {
      // For manual timers, create a completed time entry with the consumed time
      const consumedMinutes = insertTask.consumedTime || 0;
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (consumedMinutes * 60 * 1000));
      
      await db.insert(timeEntries).values({
        taskId: task.id,
        startTime: startTime,
        endTime: endTime,
        entryType: "work",
      });
      
      // Update the task to completed with end time
      await db.update(tasks)
        .set({ 
          status: "completed",
          endTime: endTime
        })
        .where(eq(tasks.id, task.id));
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
    if (updates.endTime && typeof updates.endTime === 'string') {
      processedUpdates.endTime = new Date(updates.endTime);
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
      totalDuration: this.calculateCurrentDuration(task),
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
        archivedAt: now,
        archivedBy,
        archiveNotes: notes,
        rating: rating || null,
        status: "archived",
        deliveryNumber: nextDeliveryNumber,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task;
  }

  async cancelTask(taskId: number, cancelledBy: string, reason: string): Promise<Task> {
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
        isCancelled: true,
        cancelledAt: now,
        cancelledBy,
        cancellationReason: reason,
        archivedAt: now,
        archivedBy: cancelledBy,
        archiveNotes: `مهمة ملغاة - السبب: ${reason}`,
        status: "archived",
        deliveryNumber: nextDeliveryNumber,
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
    // For manual timer tasks, use the consumed time directly
    if (task.timerType === 'manual' && task.consumedTime) {
      return task.consumedTime * 60; // Convert minutes to seconds
    }
    
    // For automatic timer tasks, check start and end times
    let startTime: Date;
    let endTime: Date;
    
    // Determine start time
    if (task.startTime) {
      startTime = new Date(task.startTime);
    } else if (task.createdAt) {
      // Use creation time as fallback for automatic tasks
      startTime = new Date(task.createdAt);
    } else {
      return 0;
    }
    
    // Determine end time based on task status
    if (task.status === 'completed' || task.status === 'archived') {
      if (task.endTime) {
        endTime = new Date(task.endTime);
      } else {
        // If task is completed but no end time, use reasonable duration
        // This might happen for old tasks that weren't properly tracked
        endTime = new Date(startTime.getTime() + (30 * 60 * 1000)); // Default 30 minutes
      }
    } else if (task.status === 'paused' && task.pausedAt) {
      endTime = new Date(task.pausedAt);
    } else if (task.status === 'active') {
      endTime = new Date(); // Current time for active tasks
    } else {
      endTime = new Date();
    }
    
    // Calculate duration in seconds
    const totalDurationMs = endTime.getTime() - startTime.getTime();
    const totalDuration = totalDurationMs / 1000;
    const pausedTime = task.totalPausedDuration || 0;
    
    // Ensure minimum reasonable duration for completed tasks
    const calculatedDuration = Math.max(0, totalDuration - pausedTime);
    
    // For completed tasks with very small duration, return a minimum of 1 minute
    if ((task.status === 'completed' || task.status === 'archived') && calculatedDuration < 60) {
      return 60; // Minimum 1 minute for completed tasks
    }
    
    return calculatedDuration;
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
    
    const [newRequest] = await db
      .insert(partsRequests)
      .values({
        ...request,
        requestNumber,
        requestedAt: new Date(),
        licensePlate: request.licensePlate || null,
        chassisNumber: request.chassisNumber || null,
        engineCode: request.engineCode || null,
      })
      .returning();
    
    return newRequest;
  }

  async updatePartsRequestStatus(id: number, status: string, notes?: string, estimatedArrival?: string): Promise<PartsRequest> {
    const updateData: any = { status };
    const now = new Date();
    
    // تسجيل الأوقات حسب الحالة
    if (status === "approved") {
      updateData.approvedAt = now;
    } else if (status === "in_preparation") {
      updateData.inPreparationAt = now;
      updateData.approvedAt = now; // تسجيل وقت الموافقة أيضاً
    } else if (status === "awaiting_pickup") {
      updateData.readyForPickupAt = now;
    } else if (status === "ordered_externally") {
      updateData.orderedExternallyAt = now;
      updateData.orderedExternallyBy = "هبة"; // يمكن تحسين هذا لاحقاً
      if (estimatedArrival) {
        updateData.estimatedArrival = estimatedArrival;
      }
    } else if (status === "parts_arrived") {
      updateData.partsArrivedAt = now;
      updateData.partsArrivedBy = "بدوي"; // يمكن تحسين هذا لاحقاً
    } else if (status === "unavailable") {
      updateData.unavailableAt = now;
      updateData.unavailableBy = "هبة"; // يمكن تحسين هذا لاحقاً
    } else if (status === "delivered") {
      updateData.deliveredAt = now;
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
        returnedAt: new Date(),
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

  // Car receipts methods
  async createCarReceipt(receiptData: InsertCarReceipt): Promise<CarReceipt> {
    // Generate receipt number
    const receiptCount = await db.select({ count: sql<number>`count(*)` }).from(carReceipts);
    const receiptNumber = `استلام-${(receiptCount[0]?.count || 0) + 1}`;

    const [receipt] = await db.insert(carReceipts).values({
      ...receiptData,
      receiptNumber,
      receivedBy: receiptData.receivedBy || "الاستقبال",
    }).returning();

    return receipt;
  }

  async getCarReceipts(): Promise<CarReceipt[]> {
    return await db.select().from(carReceipts).orderBy(desc(carReceipts.receivedAt));
  }

  async getCarReceiptById(id: number): Promise<CarReceipt | undefined> {
    const [receipt] = await db.select().from(carReceipts).where(eq(carReceipts.id, id));
    return receipt;
  }

  async updateCarReceipt(id: number, updates: Partial<InsertCarReceipt>): Promise<CarReceipt> {
    const [receipt] = await db.update(carReceipts)
      .set(updates)
      .where(eq(carReceipts.id, id))
      .returning();
    
    return receipt;
  }

  async deleteCarReceipt(id: number): Promise<void> {
    await db.delete(carReceipts).where(eq(carReceipts.id, id));
  }

  async sendCarReceiptToWorkshop(id: number, sentBy: string): Promise<CarReceipt> {
    const [receipt] = await db.update(carReceipts)
      .set({
        status: "workshop_pending",
        workshopNotificationSent: true,
        sentToWorkshopAt: new Date(),
        sentToWorkshopBy: sentBy,
      })
      .where(eq(carReceipts.id, id))
      .returning();
    
    return receipt;
  }

  async enterCarToWorkshop(id: number, enteredBy: string): Promise<CarReceipt> {
    const [receipt] = await db.update(carReceipts)
      .set({
        status: "in_workshop",
      })
      .where(eq(carReceipts.id, id))
      .returning();
    
    return receipt;
  }
}

export const storage = new DatabaseStorage();
