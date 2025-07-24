
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { neon } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import { categories, appointments, type Category, type Appointment, type InsertCategory, type InsertAppointment } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { IStorage } from "./storage";

let db: any;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required in production");
  }
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
} else {
  // Use SQLite for development
  const sqlite = new Database("dev.db");
  db = drizzleSqlite(sqlite);
  
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "categories" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "color" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "appointments" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "start_time" INTEGER NOT NULL,
      "end_time" INTEGER NOT NULL,
      "category_id" INTEGER,
      "email" TEXT,
      "notification_sent" INTEGER DEFAULT 0,
      FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    );

    INSERT OR IGNORE INTO "categories" ("id", "name", "color") VALUES 
      (1, 'Work', '#1976D2'),
      (2, 'Personal', '#4CAF50'),
      (3, 'Health', '#FF9800'),
      (4, 'Social', '#9C27B0');
  `);
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(and(
        gte(appointments.startTime, startDate),
        lte(appointments.startTime, endDate)
      ));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const appointmentData = {
      ...appointment,
      startTime: new Date(appointment.startTime),
      endTime: new Date(appointment.endTime),
    };
    
    const [newAppointment] = await db.insert(appointments).values(appointmentData).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const updateData: any = { ...appointment };
    if (appointment.startTime) {
      updateData.startTime = new Date(appointment.startTime);
    }
    if (appointment.endTime) {
      updateData.endTime = new Date(appointment.endTime);
    }

    const [updatedAppointment] = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }
    
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async markNotificationSent(id: number): Promise<void> {
    await db.update(appointments)
      .set({ notificationSent: true })
      .where(eq(appointments.id, id));
  }

  async getAppointmentsForNotification(): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(and(
        eq(appointments.notificationSent, false),
        // Only get appointments with email addresses
      ));
  }
}

export { db };
