import { categories, appointments, type Category, type Appointment, type InsertCategory, type InsertAppointment } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  markNotificationSent(id: number): Promise<void>;
  getAppointmentsForNotification(): Promise<Appointment[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private appointments: Map<number, Appointment>;
  private currentCategoryId: number;
  private currentAppointmentId: number;

  constructor() {
    this.categories = new Map();
    this.appointments = new Map();
    this.currentCategoryId = 1;
    this.currentAppointmentId = 1;
    
    // Initialize with default categories
    this.categories.set(1, { id: 1, name: "Work", color: "#1976D2" });
    this.categories.set(2, { id: 2, name: "Personal", color: "#4CAF50" });
    this.categories.set(3, { id: 3, name: "Health", color: "#FF9800" });
    this.categories.set(4, { id: 4, name: "Social", color: "#9C27B0" });
    this.currentCategoryId = 5;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      return appointmentStart >= startDate && appointmentStart <= endDate;
    });
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      startTime: new Date(insertAppointment.startTime),
      endTime: new Date(insertAppointment.endTime),
      notificationSent: false,
      description: insertAppointment.description || null,
      email: insertAppointment.email || null,
      categoryId: insertAppointment.categoryId || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updateData: Partial<InsertAppointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) {
      throw new Error('Appointment not found');
    }
    
    const updated: Appointment = { 
      ...existing, 
      ...updateData,
      startTime: updateData.startTime ? new Date(updateData.startTime) : existing.startTime,
      endTime: updateData.endTime ? new Date(updateData.endTime) : existing.endTime,
    };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }

  async markNotificationSent(id: number): Promise<void> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.notificationSent = true;
      this.appointments.set(id, appointment);
    }
  }

  async getAppointmentsForNotification(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => 
      !appointment.notificationSent && appointment.email
    );
  }
}

import { DatabaseStorage } from './db';

export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
