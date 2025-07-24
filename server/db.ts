
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { categories, appointments, type Category, type Appointment, type InsertCategory, type InsertAppointment } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please create a PostgreSQL database in Replit.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

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
