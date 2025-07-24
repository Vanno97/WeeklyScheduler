import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { getWeekStart, getWeekEnd } from "@/lib/calendar-utils";

interface WeekNavigationProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export function WeekNavigation({ 
  currentDate, 
  onPrevWeek, 
  onNextWeek, 
  onToday 
}: WeekNavigationProps) {
  const weekStart = getWeekStart(currentDate);
  const weekEnd = getWeekEnd(currentDate);

  const weekLabel = `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevWeek}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">{weekLabel}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextWeek}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="text-gray-700 hover:bg-gray-50"
            >
              Today
            </Button>
            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white text-gray-700 shadow-sm"
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                disabled
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
