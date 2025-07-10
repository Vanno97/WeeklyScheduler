import { startOfWeek, endOfWeek } from "date-fns";

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday start
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Monday start
}

export function formatTimeSlot(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}

export function parseTimeSlot(timeString: string): number {
  const [time, period] = timeString.split(" ");
  const [hours] = time.split(":").map(Number);
  
  if (period === "AM") {
    return hours === 12 ? 0 : hours;
  } else {
    return hours === 12 ? 12 : hours + 12;
  }
}
