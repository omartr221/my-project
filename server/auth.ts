import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
      permissions: string[];
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Authorization middleware functions
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "غير مسموح - يجب تسجيل الدخول أولاً" });
  }
  next();
}

export function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "غير مسموح - يجب تسجيل الدخول أولاً" });
    }
    
    const user = req.user;
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions || '[]');
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: `غير مسموح - تحتاج إلى صلاحية ${permission}` });
    }
    
    next();
  };
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "غير مسموح - يجب تسجيل الدخول أولاً" });
  }
  
  const user = req.user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "غير مسموح - تحتاج إلى صلاحيات إدارية" });
  }
  
  next();
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "v-power-tuning-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        console.error("🚨 Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "اسم المستخدم موجود مسبقاً" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Initialize default users
  initializeDefaultUsers();
}

async function initializeDefaultUsers() {
  try {
    // Check if the finance user exists
    const existingFinanceUser = await storage.getUserByUsername("ملك");
    if (!existingFinanceUser) {
      // Create the default finance user
      await storage.createUser({
        username: "ملك",
        password: await hashPassword("12345"),
        role: "finance",
        permissions: [
          "dashboard:read",
          "tasks:read",
          "archive:read",
          "customers:read"
        ],
      });
      console.log("✓ تم إنشاء مستخدم المالية: ملك");
    }

    // Check if the operator user exists
    const existingOperatorUser = await storage.getUserByUsername("بدوي");
    if (!existingOperatorUser) {
      // Create the operator user
      await storage.createUser({
        username: "بدوي",
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
        ],
      });
      console.log("✓ تم إنشاء مستخدم العمليات: بدوي");
    }

    // Check if the viewer user exists
    const existingViewerUser = await storage.getUserByUsername("هبة");
    if (!existingViewerUser) {
      // Create the viewer user
      await storage.createUser({
        username: "هبة",
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
        ],
      });
      console.log("✓ تم إنشاء مستخدم المشاهدة: هبة");
    }

    // Check if the supervisor user exists
    const existingSupervisorUser = await storage.getUserByUsername("روان");
    if (!existingSupervisorUser) {
      // Create the supervisor user
      await storage.createUser({
        username: "روان",
        password: await hashPassword("1234567"),
        role: "supervisor",
        permissions: [
          "dashboard:read",
          "timers:read",
          "tasks:read",
          "tasks:create",
          "archive:read",
          "customers:read"
        ],
      });
      console.log("✓ تم إنشاء مستخدم المشرف: روان");
    }

    // Check if the admin user "فارس" exists
    const existingAdminUser = await storage.getUserByUsername("فارس");
    if (!existingAdminUser) {
      // Create the admin user
      await storage.createUser({
        username: "فارس",
        password: await hashPassword("faris441111"),
        role: "admin",
        permissions: [
          "dashboard:read",
          "dashboard:write",
          "timers:read",
          "timers:write",
          "tasks:read",
          "tasks:write",
          "tasks:create",
          "tasks:edit",
          "tasks:delete",
          "archive:read",
          "archive:write",
          "customers:read",
          "customers:write",
          "customers:create",
          "customers:edit",
          "customers:delete",
          "parts:read",
          "parts:write",
          "parts:create",
          "parts:approve",
          "parts:reject",
          "workers:read",
          "workers:write",
          "workers:create",
          "workers:edit",
          "workers:delete",
          "receipts:read",
          "receipts:write",
          "receipts:create",
          "receipts:edit",
          "receipts:delete"
        ],
      });
      console.log("✓ تم إنشاء مستخدم الإدارة: فارس");
    }

    // Check if the reception user exists
    const existingReceptionUser = await storage.getUserByUsername("الاستقبال");
    if (!existingReceptionUser) {
      // Create the reception user
      await storage.createUser({
        username: "الاستقبال",
        password: await hashPassword("11"),
        role: "reception",
        permissions: [
          "timers:read",
          "tasks:read",
          "parts:read",
          "receipts:read",
          "receipts:write",
          "receipts:create",
          "customers:read",
          "customers:write",
          "customers:create"
        ],
      });
      console.log("✓ تم إنشاء مستخدم الاستقبال: الاستقبال");
    } else {
      // Update existing reception user with new permissions
      const updatedPermissions = [
        "timers:read",
        "tasks:read",
        "parts:read",
        "receipts:read",
        "receipts:write",
        "receipts:create",
        "customers:read",
        "customers:write",
        "customers:create"
      ];
      await storage.updateUserPermissions("الاستقبال", updatedPermissions);
      console.log("✓ تم تحديث صلاحيات مستخدم الاستقبال");
    }
  } catch (error) {
    console.error("خطأ في إنشاء المستخدمين الافتراضيين:", error);
  }
}