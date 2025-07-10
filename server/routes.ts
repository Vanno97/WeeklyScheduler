import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { checkConflicts } from "./services/scheduler";
import { sendNotificationEmail } from "./services/notification";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(category);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid category data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let appointments;
      
      if (startDate && endDate) {
        appointments = await storage.getAppointmentsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointment = insertAppointmentSchema.parse(req.body);
      
      // Check for conflicts
      const conflicts = await checkConflicts(appointment);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          error: "Appointment conflicts with existing events", 
          conflicts 
        });
      }
      
      const newAppointment = await storage.createAppointment(appointment);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid appointment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create appointment" });
      }
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = insertAppointmentSchema.partial().parse(req.body);
      
      // Check for conflicts if times are being updated
      if (appointment.startTime || appointment.endTime) {
        const conflicts = await checkConflicts(appointment, id);
        if (conflicts.length > 0) {
          return res.status(409).json({ 
            error: "Appointment conflicts with existing events", 
            conflicts 
          });
        }
      }
      
      const updatedAppointment = await storage.updateAppointment(id, appointment);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid appointment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update appointment" });
      }
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Test email notification
  app.post("/api/test-notification", async (req, res) => {
    try {
      const { email, title, startTime } = req.body;
      await sendNotificationEmail(email, title, new Date(startTime));
      res.json({ message: "Test notification sent" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
