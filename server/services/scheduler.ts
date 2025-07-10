import cron from 'node-cron';
import { storage } from '../storage';
import { sendNotificationEmail } from './notification';
import type { Appointment, InsertAppointment } from '@shared/schema';

// Check for appointment conflicts
export async function checkConflicts(
  appointment: Partial<InsertAppointment>,
  excludeId?: number
): Promise<Appointment[]> {
  if (!appointment.startTime || !appointment.endTime) {
    return [];
  }

  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  const existingAppointments = await storage.getAppointments();

  return existingAppointments.filter(existing => {
    if (excludeId && existing.id === excludeId) {
      return false;
    }

    const existingStart = new Date(existing.startTime);
    const existingEnd = new Date(existing.endTime);

    // Check if there's any overlap
    return (
      (startTime < existingEnd && endTime > existingStart) ||
      (existingStart < endTime && existingEnd > startTime)
    );
  });
}

// Schedule notifications
export function startNotificationScheduler() {
  // Run every minute to check for upcoming appointments
  cron.schedule('* * * * *', async () => {
    try {
      const appointments = await storage.getAppointmentsForNotification();
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      for (const appointment of appointments) {
        const startTime = new Date(appointment.startTime);
        
        // Check if appointment starts in the next 30 minutes
        if (startTime > now && startTime <= thirtyMinutesFromNow && appointment.email) {
          try {
            await sendNotificationEmail(appointment.email, appointment.title, startTime);
            await storage.markNotificationSent(appointment.id);
            console.log(`Notification sent for appointment: ${appointment.title}`);
          } catch (error) {
            console.error(`Failed to send notification for appointment ${appointment.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in notification scheduler:', error);
    }
  });

  console.log('Notification scheduler started - checking every minute for upcoming appointments');
}

// Start the scheduler when the server starts
startNotificationScheduler();
