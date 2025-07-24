import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { WeekNavigation } from "@/components/calendar/week-navigation";
import { EventModal } from "@/components/calendar/event-modal";
import { CategoryModal } from "@/components/calendar/category-modal";
import { MobileMenu } from "@/components/calendar/mobile-menu";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getWeekStart, getWeekEnd } from "@/lib/calendar-utils";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const isMobile = useIsMobile();

  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);

  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString()
      });
      const response = await fetch(`/api/appointments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleNewEvent = (day?: number, hour?: number) => {
    setSelectedSlot(day !== undefined && hour !== undefined ? { day, hour } : null);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setSelectedSlot(null);
    setIsEventModalOpen(true);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CalendarDays className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Weekly Agenda</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => handleNewEvent()}
                className="bg-primary text-white hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {!isMobile && <span>New Event</span>}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Week Navigation */}
      <WeekNavigation
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CalendarGrid
          currentDate={currentDate}
          appointments={appointments}
          categories={categories}
          onSlotClick={handleNewEvent}
          onEventClick={handleEditEvent}
        />
      </div>

      {/* Modals */}
      <EventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        categories={categories}
        selectedSlot={selectedSlot}
        currentDate={currentDate}
        editingEvent={editingEvent}
      />

      <CategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        categories={categories}
      />

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu
          onNewEvent={() => handleNewEvent()}
          onManageCategories={() => setIsCategoryModalOpen(true)}
        />
      )}
    </div>
  );
}
