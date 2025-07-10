import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { getWeekStart } from "@/lib/calendar-utils";
import type { Appointment, Category } from "@shared/schema";

interface CalendarGridProps {
  currentDate: Date;
  appointments: Appointment[];
  categories: Category[];
  onSlotClick: (day: number, hour: number) => void;
  onEventClick: (event: Appointment) => void;
}

const timeSlots = [
  { hour: 9, label: "9:00 AM" },
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
  { hour: 13, label: "1:00 PM" },
  { hour: 14, label: "2:00 PM" },
  { hour: 15, label: "3:00 PM" },
  { hour: 16, label: "4:00 PM" },
  { hour: 17, label: "5:00 PM" },
];

export function CalendarGrid({ 
  currentDate, 
  appointments, 
  categories, 
  onSlotClick, 
  onEventClick 
}: CalendarGridProps) {
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return "#1976D2";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#1976D2";
  };

  const getAppointmentForSlot = (day: Date, hour: number) => {
    return appointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);
      return isSameDay(appointmentStart, day) && 
             appointmentStart.getHours() <= hour && 
             appointmentEnd.getHours() > hour;
    });
  };

  const getAppointmentHeight = (appointment: Appointment) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const startHour = start.getHours();
    const endHour = end.getHours();
    const duration = endHour - startHour;
    return Math.max(1, duration);
  };

  const isAppointmentStart = (appointment: Appointment, hour: number) => {
    const appointmentStart = new Date(appointment.startTime);
    return appointmentStart.getHours() === hour;
  };

  const formatEventTime = (appointment: Appointment) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const startTime = format(start, "h:mm a");
    const endTime = format(end, "h:mm a");
    return `${startTime} - ${endTime}`;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
        <div className="p-4 text-center font-medium text-gray-500 text-sm">Time</div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-4 text-center font-medium text-gray-700 border-l border-gray-200">
            <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
            <div className={cn(
              "text-lg font-semibold",
              isSameDay(day, today) && "text-primary"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="relative">
        {timeSlots.map((slot, slotIndex) => (
          <div 
            key={slot.hour} 
            className={`grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
              slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'
            }`}
          >
            <div className="p-3 text-xs text-gray-500 font-medium bg-gray-50 border-r border-gray-200">
              {slot.label}
            </div>
            {weekDays.map((day, dayIndex) => {
              const appointment = getAppointmentForSlot(day, slot.hour);
              return (
                <div
                  key={`${dayIndex}-${slot.hour}`}
                  className="p-3 border-r border-gray-200 min-h-[60px] relative cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => {
                    if (appointment) {
                      onEventClick(appointment);
                    } else {
                      onSlotClick(dayIndex, slot.hour);
                    }
                  }}
                >
                  {appointment && isAppointmentStart(appointment, slot.hour) && (
                    <div 
                      className="absolute inset-1 text-white rounded-md p-2 text-xs font-medium shadow-sm z-10"
                      style={{ 
                        backgroundColor: getCategoryColor(appointment.categoryId),
                        height: `${getAppointmentHeight(appointment) * 60 - 8}px`
                      }}
                    >
                      <div className="font-semibold truncate">{appointment.title}</div>
                      <div className="opacity-90 text-xs">
                        {formatEventTime(appointment)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
